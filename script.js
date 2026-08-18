/* ============================================================
   INOCEL — page d'accueil V3
   ============================================================ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   1. Titre découpé en mots
------------------------------------------------------------ */
(function splitTitles() {
  if (REDUCED) return;
  document.querySelectorAll('[data-split]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const outer = document.createElement('span');
      outer.className = 'word';
      const inner = document.createElement('span');
      inner.textContent = w;
      inner.style.setProperty('--d', 80 + i * 70 + 'ms');
      outer.append(inner);
      el.append(outer, document.createTextNode(' '));
    });
    el.setAttribute('data-reveal', '');
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
})();

/* ------------------------------------------------------------
   2. Révélation au scroll
------------------------------------------------------------ */
(function reveal() {
  const targets = document.querySelectorAll('[data-reveal],[data-stagger]');
  if (REDUCED || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in'));
    return;
  }
  targets.forEach(el => {
    if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay + 'ms');
    if (el.hasAttribute('data-stagger')) {
      [...el.children].forEach((c, i) => c.style.setProperty('--d', i * 95 + 'ms'));
    }
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  targets.forEach(el => io.observe(el));
})();

/* ------------------------------------------------------------
   3. Texte qui s'allume mot à mot au scroll
------------------------------------------------------------ */
(function highlightText() {
  const blocks = document.querySelectorAll('[data-highlight]');
  if (!blocks.length) return;

  const prepared = [];
  blocks.forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    const spans = words.map(w => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      el.append(s, document.createTextNode(' '));
      return s;
    });
    if (REDUCED) { spans.forEach(s => s.classList.add('on')); return; }
    prepared.push({ el, spans });
  });
  if (!prepared.length) return;

  let ticking = false;
  const paint = () => {
    ticking = false;
    const vh = window.innerHeight;
    prepared.forEach(({ el, spans }) => {
      const r = el.getBoundingClientRect();
      const start = vh * 0.85;
      const end = vh * 0.32;
      const p = (start - r.top) / (start - end);
      const cut = Math.round(Math.max(0, Math.min(1, p)) * spans.length);
      spans.forEach((s, i) => s.classList.toggle('on', i < cut));
    });
  };
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  }, { passive: true });
  window.addEventListener('resize', paint);
  paint();
})();

/* ------------------------------------------------------------
   4. Piste de progression verticale
   La barre se remplit et le marqueur descend au fil du scroll
   dans la section. On mesure la progression entre le moment où
   le haut de la liste atteint le milieu de l'écran et celui où
   son bas le dépasse.
------------------------------------------------------------ */
(function progressTrack() {
  const track = document.querySelector('.track__in');
  if (!track || REDUCED) return;

  const rail = track.querySelector('.track__rail');
  const items = track.querySelector('.track__items');
  if (!rail || !items) return;

  let ticking = false;
  const paint = () => {
    ticking = false;
    const r = items.getBoundingClientRect();
    const anchor = window.innerHeight * 0.55;
    const total = r.height;
    const done = anchor - r.top;
    const p = Math.max(0, Math.min(1, done / total));
    rail.style.setProperty('--fill', (p * 100).toFixed(2) + '%');
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  }, { passive: true });
  window.addEventListener('resize', paint);
  paint();
})();

/* ------------------------------------------------------------
   5. Vidéo de fond du hero (YouTube) + bouton pause
   Le lecteur YouTube exige une origine valide : en file:// il
   renvoie « Error 153 ». On n'injecte donc l'iframe que sur une
   page servie en http/https ; sinon l'image de fond reste.
   En production, c'est ici qu'on conditionne le chargement à
   l'acceptation des cookies.
------------------------------------------------------------ */

(function heroVideo() {
  const hero = document.querySelector('.hero[data-yt]');
  const toggle = document.getElementById('heroToggle');
  if (!hero) return;

  if (!/^https?:$/.test(window.location.protocol) || REDUCED) {
    toggle?.remove();
    return;
  }

  const id = hero.dataset.yt;
  const params = [
    'autoplay=1', 'mute=1', 'loop=1', `playlist=${id}`,
    'controls=0', 'disablekb=1', 'modestbranding=1',
    'rel=0', 'playsinline=1', 'iv_load_policy=3', 'enablejsapi=1',
  ].join('&');

  const frame = document.createElement('iframe');
  frame.className = 'hero__yt';
  frame.title = 'INOCEL — GEN-Z 300';
  frame.allow = 'autoplay; encrypted-media';
  frame.setAttribute('tabindex', '-1');
  frame.setAttribute('frameborder', '0');
  frame.src = `https://www.youtube-nocookie.com/embed/${id}?${params}`;
  hero.prepend(frame);

  // pilotage via l'API postMessage de YouTube (pas de librairie à charger)
  let paused = false;
  const send = fn => frame.contentWindow?.postMessage(
    JSON.stringify({ event: 'command', func: fn, args: [] }), '*'
  );

  toggle?.addEventListener('click', () => {
    paused = !paused;
    send(paused ? 'pauseVideo' : 'playVideo');
    toggle.classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
  });
})();

/* ------------------------------------------------------------
   6. Méga-menu : état aria + ouverture au clavier
   Le survol est géré en CSS ; ici on tient aria-expanded à jour
   et on permet d'ouvrir/fermer les panneaux au clavier.
------------------------------------------------------------ */
(function megaMenu() {
  const items = document.querySelectorAll('.nav__item');
  if (!items.length) return;

  const closeAll = except => items.forEach(i => {
    if (i === except) return;
    i.classList.remove('is-open');
    i.querySelector('.nav__link')?.setAttribute('aria-expanded', 'false');
  });

  items.forEach(item => {
    const btn = item.querySelector('.nav__link');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      closeAll(item);
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });

    item.addEventListener('mouseenter', () => btn.setAttribute('aria-expanded', 'true'));
    item.addEventListener('mouseleave', () => {
      if (!item.classList.contains('is-open')) btn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(null); });
  document.addEventListener('click', e => { if (!e.target.closest('.nav__item')) closeAll(null); });
})();

/* ------------------------------------------------------------
   7. Header : masqué au défilement vers le bas, rendu au retour
   En bas de course il disparaît entièrement ; dès qu'on remonte
   il revient, en version compacte (sans la ligne de coordonnées).
   Celle-ci ne réapparaît qu'une fois revenu tout en haut.
------------------------------------------------------------ */
(function stickyHeader() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const TOP = 80;      // zone haute : header entier
  const SEUIL = 6;     // amplitude minimale pour éviter le tremblement
  let last = window.scrollY;
  let ticking = false;

  const paint = () => {
    ticking = false;
    const y = window.scrollY;
    const delta = y - last;

    if (y <= TOP) {
      nav.classList.remove('is-hidden', 'is-compact');
    } else if (delta > SEUIL) {
      nav.classList.add('is-hidden', 'is-compact');
    } else if (delta < -SEUIL) {
      nav.classList.remove('is-hidden');
      nav.classList.add('is-compact');
    }

    if (Math.abs(delta) > SEUIL) last = y;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  }, { passive: true });
  paint();
})();

/* ------------------------------------------------------------
   8. Onglets sectoriels
   Un seul panneau visible à la fois. Les flèches gauche/droite
   déplacent la sélection, comme attendu d'un tablist.
------------------------------------------------------------ */
(function sectorTabs() {
  const bar = document.querySelector('.stabs__bar');
  if (!bar) return;

  const tabs = [...bar.querySelectorAll('.stab')];
  const panels = [...document.querySelectorAll('.spanel')];

  const select = i => {
    tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
    panels.forEach((p, k) => p.classList.toggle('is-on', k === i));
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', e => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const next = (i + dir + tabs.length) % tabs.length;
      select(next);
      tabs[next].focus();
    });
  });
})();

/* ------------------------------------------------------------
   9. Calculateur d'émissions (page dédiée)
   Ne s'active que si le formulaire est présent, donc inerte
   sur la page d'accueil.
   Hypothèses (à faire valider par INOCEL) :
   0,25 L/kWh · 2,68 kg CO2/L · 70 % de charge
   2,0 t CO2 par voiture et par an · 30 000 L par camion-citerne
------------------------------------------------------------ */
(function calculator() {
  const form = document.getElementById('calcForm');
  if (!form) return;

  const L_PER_KWH = 0.25, KG_CO2_PER_L = 2.68, LOAD = 0.7;
  const T_CO2_PER_CAR = 2.0, L_PER_TANKER = 30000;

  const power = document.getElementById('power');
  const hours = document.getElementById('hours');
  const days = document.getElementById('days');
  const inputs = [power, hours, days];

  const outs = {
    co2: document.getElementById('resCo2'),
    diesel: document.getElementById('resDiesel'),
    cars: document.getElementById('resCars'),
    truck: document.getElementById('resTruck'),
  };

  const nf = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
  const shown = { co2: 0, diesel: 0, cars: 0, truck: 0 };
  let raf = null;

  const paint = el => {
    const p = ((el.value - el.min) / (el.max - el.min)) * 100;
    el.style.setProperty('--fill', p + '%');
  };

  const animateTo = targets => {
    if (REDUCED) {
      Object.keys(targets).forEach(k => { shown[k] = targets[k]; outs[k].textContent = nf.format(targets[k]); });
      return;
    }
    cancelAnimationFrame(raf);
    const step = () => {
      let moving = false;
      Object.keys(targets).forEach(k => {
        const diff = targets[k] - shown[k];
        if (Math.abs(diff) > Math.max(targets[k] * 0.001, 0.5)) { shown[k] += diff * 0.18; moving = true; }
        else shown[k] = targets[k];
        outs[k].textContent = nf.format(shown[k]);
      });
      if (moving) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  function update() {
    document.getElementById('powerOut').textContent = power.value + ' kVA';
    document.getElementById('hoursOut').textContent = hours.value + ' h';
    document.getElementById('daysOut').textContent = days.value + ' d';
    inputs.forEach(paint);

    const kwh = power.value * 0.8 * LOAD * hours.value * days.value; // kVA → kW ≈ ×0,8
    const litres = kwh * L_PER_KWH;
    const tonnes = (litres * KG_CO2_PER_L) / 1000;

    animateTo({ co2: tonnes, diesel: litres, cars: tonnes / T_CO2_PER_CAR, truck: litres / L_PER_TANKER });
  }

  inputs.forEach(el => el.addEventListener('input', update));
  inputs.forEach(paint);
  update();
})();

/* ------------------------------------------------------------
   10. Widget de chat (maquette)
   Simple ouverture / fermeture de la carte. Le vrai widget sera
   fourni par HubSpot ; ce bloc sera alors à supprimer.
------------------------------------------------------------ */
(function chatWidget() {
  const chat = document.getElementById('chat');
  const btn = document.getElementById('chatBtn');
  const close = document.getElementById('chatClose');
  if (!chat || !btn) return;

  const setOpen = open => {
    chat.classList.toggle('is-closed', !open);
    btn.setAttribute('aria-expanded', String(open));
  };

  btn.addEventListener('click', () => setOpen(chat.classList.contains('is-closed')));
  close?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !chat.classList.contains('is-closed')) setOpen(false);
  });

  // la carte peut recouvrir un CTA selon la page : celle-ci décide
  setOpen(chat.dataset.chat !== 'closed'); // ouvert au chargement, comme le widget de référence
})();

/* ------------------------------------------------------------
   11. Accordéon des enjeux
   Comportement de FAQ : un clic ouvre ou referme le panneau,
   sans jamais déplacer les éléments. Un seul ouvert à la fois.
------------------------------------------------------------ */
(function enjeux() {
  const box = document.getElementById('enjeux');
  if (!box) return;

  const items = [...box.querySelectorAll('.eitem')];
  items.forEach(item => {
    const head = item.querySelector('.eitem__head');
    head.addEventListener('click', () => {
      const ouvrir = !item.classList.contains('is-on');
      items.forEach(i => {
        i.classList.remove('is-on');
        i.querySelector('.eitem__head').setAttribute('aria-expanded', 'false');
      });
      if (ouvrir) {
        item.classList.add('is-on');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
