/* ============================================================
   INOCEL — maquette page d'accueil
   ============================================================ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   1. Découpe du H1 en mots (révélation ligne par ligne)
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
   2. Révélation au scroll (+ décalage des groupes)
------------------------------------------------------------ */
(function reveal() {
  const targets = document.querySelectorAll('[data-reveal],[data-stagger]');

  if (REDUCED || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in'));
    return;
  }

  // délai propre à chaque élément
  targets.forEach(el => {
    if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay + 'ms');
    if (el.hasAttribute('data-stagger')) {
      [...el.children].forEach((c, i) => c.style.setProperty('--d', i * 90 + 'ms'));
    }
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  targets.forEach(el => io.observe(el));
})();

/* ------------------------------------------------------------
   3. Compteurs animés (bandeau de chiffres)
------------------------------------------------------------ */
(function counters() {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;

  if (REDUCED || !('IntersectionObserver' in window)) {
    nums.forEach(n => (n.textContent = n.dataset.count));
    return;
  }

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const dur = 1400;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      run(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.6 });

  nums.forEach(n => io.observe(n));
})();

/* ------------------------------------------------------------
   4. Calculateur d'émissions
   Hypothèses (à valider avec INOCEL) :
   - groupe diesel : 0,25 L/kWh
   - facteur d'émission gazole : 2,68 kg CO2 / L
   - taux de charge moyen : 70 %
   - voiture moyenne : 2,0 t CO2 / an
------------------------------------------------------------ */
(function calculator() {
  const form = document.getElementById('calcForm');
  if (!form) return;

  const L_PER_KWH = 0.25;
  const KG_CO2_PER_L = 2.68;
  const LOAD_FACTOR = 0.7;
  const T_CO2_PER_CAR = 2.0;

  const power = document.getElementById('power');
  const hours = document.getElementById('hours');
  const days = document.getElementById('days');
  const inputs = [power, hours, days];

  const outs = {
    diesel: document.getElementById('resDiesel'),
    co2: document.getElementById('resCo2'),
    cars: document.getElementById('resCars'),
  };

  const nf = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
  const shown = { diesel: 0, co2: 0, cars: 0 };
  let raf = null;

  // remplissage coloré de la piste du slider
  const paint = (el) => {
    const p = ((el.value - el.min) / (el.max - el.min)) * 100;
    el.style.setProperty('--fill', p + '%');
  };

  // interpolation douce des résultats
  const animateTo = (targets) => {
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

    animateTo({ diesel: litres, co2: tonnes, cars: tonnes / T_CO2_PER_CAR });
  }

  inputs.forEach(el => el.addEventListener('input', update));
  inputs.forEach(paint);

  // premier calcul quand la section arrive à l'écran
  if (!REDUCED && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      update();
      io.disconnect();
    }, { threshold: 0.3 });
    io.observe(form);
  } else {
    update();
  }
})();

/* ------------------------------------------------------------
   5. Header : état "collé"
------------------------------------------------------------ */
(function stickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ------------------------------------------------------------
   6. Modale vidéo (encart du hero)
------------------------------------------------------------ */
(function videoModal() {
  const modal = document.getElementById('vmodal');
  const open = document.getElementById('playHero');
  const close = document.getElementById('vclose');
  const player = document.getElementById('vplayer');
  if (!modal || !open) return;

  let lastFocus = null;

  const show = () => {
    lastFocus = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    close.focus();
    player.play?.().catch(() => {});
  };

  const hide = () => {
    modal.classList.remove('is-open');
    player.pause();
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; lastFocus?.focus(); }, 350);
  };

  open.addEventListener('click', show);
  close.addEventListener('click', hide);
  modal.addEventListener('click', e => { if (e.target === modal) hide(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) hide();
  });
})();

/* ------------------------------------------------------------
   7. Formulaire (démo)
------------------------------------------------------------ */
document.querySelector('.form')?.addEventListener('submit', e => {
  e.preventDefault();
  alert('Maquette — le formulaire sera branché sur HubSpot lors de l’intégration WordPress.');
});
