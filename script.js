/* ============================================================
   INOCEL — maquette page d'accueil
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
      inner.style.setProperty('--d', 60 + i * 55 + 'ms');
      outer.append(inner);
      el.append(outer, document.createTextNode(' '));
    });
    el.setAttribute('data-reveal', '');
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
})();

/* ------------------------------------------------------------
   2. Gros paragraphe qui s'allume mot à mot au scroll
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
      // 0 quand le bloc entre par le bas, 1 quand il a remonté au tiers haut
      const start = vh * 0.85;
      const end = vh * 0.3;
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
   3. Révélation au scroll
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
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  targets.forEach(el => io.observe(el));
})();

/* ------------------------------------------------------------
   4. Compteurs à rouleau (odomètre)
------------------------------------------------------------ */
(function odometers() {
  const nodes = document.querySelectorAll('[data-odo]');
  if (!nodes.length) return;

  nodes.forEach(node => {
    const digits = String(node.dataset.odo).split('');

    if (REDUCED) { node.textContent = node.dataset.odo; return; }

    node.classList.add('odo');
    digits.forEach((d, i) => {
      const col = document.createElement('span');
      col.className = 'odo__col';
      col.style.setProperty('--d', i * 110 + 'ms');
      // 0..9 puis le chiffre cible, pour finir sur un tour complet
      for (let n = 0; n <= 9; n++) {
        const s = document.createElement('span');
        s.textContent = n;
        col.append(s);
      }
      const last = document.createElement('span');
      last.textContent = d;
      col.append(last);
      node.append(col);
      col.dataset.target = 10; // index du dernier élément
    });
  });

  if (REDUCED || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.odo__col').forEach(col => {
        col.style.transform = `translateY(-${col.dataset.target}em)`;
      });
      io.unobserve(e.target);
    });
  }, { threshold: 0.6 });

  nodes.forEach(n => io.observe(n));
})();

/* ------------------------------------------------------------
   5. Calculateur d'émissions
   Hypothèses (à valider avec INOCEL) :
   - groupe diesel : 0,25 L/kWh
   - facteur d'émission gazole : 2,68 kg CO2 / L
   - taux de charge moyen : 70 %
   - voiture moyenne : 2,0 t CO2 / an
   - camion-citerne : 30 000 L par livraison
------------------------------------------------------------ */
(function calculator() {
  const form = document.getElementById('calcForm');
  if (!form) return;

  const L_PER_KWH = 0.25;
  const KG_CO2_PER_L = 2.68;
  const LOAD_FACTOR = 0.7;
  const T_CO2_PER_CAR = 2.0;
  const L_PER_TANKER = 30000;

  const power = document.getElementById('power');
  const hours = document.getElementById('hours');
  const days = document.getElementById('days');
  const inputs = [power, hours, days];

  const outs = {
    diesel: document.getElementById('resDiesel'),
    co2: document.getElementById('resCo2'),
    cars: document.getElementById('resCars'),
    truck: document.getElementById('resTruck'),
  };

  const nf = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
  const shown = { diesel: 0, co2: 0, cars: 0, truck: 0 };
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
        if (Math.abs(diff) > Math.max(targets[k] * 0.001, 0.5)) {
          shown[k] += diff * 0.18;
          moving = true;
        } else {
          shown[k] = targets[k];
        }
        outs[k].textContent = nf.format(shown[k]);
      });
      if (moving) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  function update() {
    document.getElementById('powerOut').textContent = power.value + ' kVA';
    document.getElementById('hoursOut').textContent = hours.value + ' h';
    document.getElementById('daysOut').textContent = days.value + ' days';
    inputs.forEach(paint);

    const kwh = power.value * 0.8 * LOAD_FACTOR * hours.value * days.value; // kVA → kW ≈ ×0,8
    const litres = kwh * L_PER_KWH;
    const tonnes = (litres * KG_CO2_PER_L) / 1000;

    animateTo({
      diesel: litres,
      co2: tonnes,
      cars: tonnes / T_CO2_PER_CAR,
      truck: litres / L_PER_TANKER,
    });
  }

  inputs.forEach(el => el.addEventListener('input', update));
  inputs.forEach(paint);

  if (!REDUCED && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      update();
      io.disconnect();
    }, { threshold: 0.25 });
    io.observe(form);
  } else {
    update();
  }
})();

/* ------------------------------------------------------------
   6. Header collé
------------------------------------------------------------ */
(function stickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ------------------------------------------------------------
   7. Vidéo de fond du bandeau (YouTube)

   Le lecteur YouTube exige une origine valide : chargé depuis un
   fichier ouvert en direct (file://), il renvoie « Error 153 —
   Video player configuration error ». On n'injecte donc l'iframe
   que sur une page servie en http/https ; sinon l'image de fond
   du bandeau reste affichée.

   En production, c'est aussi le bon endroit pour conditionner le
   chargement à l'acceptation des cookies.
------------------------------------------------------------ */
(function bandVideo() {
  const band = document.querySelector('.band[data-yt]');
  if (!band) return;
  if (!/^https?:$/.test(window.location.protocol)) return;

  const id = band.dataset.yt;
  const params = [
    'autoplay=1', 'mute=1', 'loop=1', `playlist=${id}`,
    'controls=0', 'disablekb=1', 'modestbranding=1',
    'rel=0', 'playsinline=1', 'iv_load_policy=3',
  ].join('&');

  const frame = document.createElement('iframe');
  frame.className = 'band__yt';
  frame.title = 'INOCEL — GEN-Z 300';
  frame.allow = 'autoplay; encrypted-media';
  frame.setAttribute('tabindex', '-1');
  frame.setAttribute('frameborder', '0');
  frame.src = `https://www.youtube-nocookie.com/embed/${id}?${params}`;

  band.prepend(frame); // avant le voile, qui doit rester au-dessus
})();

/* ------------------------------------------------------------
   8. Formulaire (démo)
------------------------------------------------------------ */
document.querySelector('.form')?.addEventListener('submit', e => {
  e.preventDefault();
  alert('Maquette — le formulaire sera branché sur HubSpot lors de l’intégration WordPress.');
});
