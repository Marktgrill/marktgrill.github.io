/* Marktgrill: Galerie fuer die Catering-Seite. Liest galerie.json (wird im Admin gepflegt). */
(function () {
  const root = document.getElementById('gallery');
  if (!root) return;
  const section = root.closest('.gallery-section');
  const VIDEO = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let items = [];
  let current = 0;

  const esc = t => { const d = document.createElement('div'); d.textContent = t == null ? '' : t; return d.innerHTML; };
  const path = p => String(p || '').replace(/^\/+/, '');

  function tile(it, i) {
    const f = path(it.datei);
    const alt = esc(it.titel || 'Eindruck von unserem Catering');
    const cap = it.titel ? `<span class="g-cap">${esc(it.titel)}</span>` : '';
    const media = VIDEO.test(f)
      ? `<video src="${esc(f)}#t=0.1" ${it.vorschau ? `poster="${esc(path(it.vorschau))}"` : ''} muted loop playsinline preload="metadata"></video>` +
        `<span class="g-badge"><i class="fa-solid fa-${it.mit_ton ? 'volume-high' : 'play'}"></i></span>`
      : `<img src="${esc(f)}" alt="${alt}" loading="lazy" decoding="async">`;
    return `<button type="button" class="g-item" data-i="${i}" aria-label="${alt} öffnen">${media}${cap}</button>`;
  }

  // ---------- Lightbox ----------
  const lb = document.createElement('div');
  lb.className = 'g-lightbox';
  lb.hidden = true;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<button class="g-close" aria-label="Schließen">&times;</button>' +
    '<button class="g-nav g-prev" aria-label="Zurück">&#8249;</button><div class="g-stage"></div>' +
    '<button class="g-nav g-next" aria-label="Weiter">&#8250;</button><div class="g-caption"></div>';
  document.body.appendChild(lb);
  const stage = lb.querySelector('.g-stage');
  const caption = lb.querySelector('.g-caption');

  function show(i) {
    current = (i + items.length) % items.length;
    const it = items[current];
    const f = esc(path(it.datei));
    if (VIDEO.test(it.datei)) {
      stage.innerHTML = `<video src="${f}" ${it.mit_ton ? 'controls' : ''} ${it.vorschau ? `poster="${esc(path(it.vorschau))}"` : ''} playsinline loop></video>`;
      const v = stage.querySelector('video');
      v.muted = !it.mit_ton;            // ohne Ton: stumm, mit Ton: Bedienleiste und Ton
      v.play().catch(() => { v.controls = true; });
    } else {
      stage.innerHTML = `<img src="${f}" alt="${esc(it.titel || '')}">`;
    }
    caption.textContent = it.titel || '';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    stage.innerHTML = '';             // stoppt laufende Videos
    lb.hidden = true;
    document.body.style.overflow = '';
  }

  lb.addEventListener('click', e => {
    if (e.target.closest('.g-close') || e.target === lb || e.target === stage) close();
    else if (e.target.closest('.g-prev')) show(current - 1);
    else if (e.target.closest('.g-next')) show(current + 1);
  });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 60) show(current + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  // ---------- Laden & Anzeigen ----------
  fetch('galerie.json?t=' + Date.now())
    .then(r => r.json())
    .then(d => {
      items = (d.eintraege || []).filter(x => x && x.datei);
      if (!items.length) { section.remove(); return; }
      root.innerHTML = items.map(tile).join('');
      root.addEventListener('click', e => {
        const b = e.target.closest('.g-item');
        if (b) show(+b.dataset.i);
      });
      if (!reduce) {                  // stumme Vorschau-Videos nur abspielen, solange sichtbar
        const io = new IntersectionObserver(es => es.forEach(en => {
          if (en.isIntersecting) en.target.play().catch(() => {}); else en.target.pause();
        }), { threshold: 0.35 });
        root.querySelectorAll('video').forEach(v => io.observe(v));
      }
    })
    .catch(() => section.remove());
})();
