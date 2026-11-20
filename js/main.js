(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = '526692528566';
  const wa = (t) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;

  /* ---------- preloader ---------- */
  const pre = $('#preloader');
  const done = () => { pre.classList.add('is-done'); document.body.classList.add('is-loaded'); };
  window.addEventListener('load', () => setTimeout(done, 500));
  setTimeout(done, 3000);
  $('#year').textContent = new Date().getFullYear();

  /* ---------- header, progress, fab ---------- */
  const header = $('#header'), bar = $('#progress'), fab = $('#fab');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('is-scrolled', y > 40);
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    fab.classList.toggle('is-on', y > innerHeight * .7);
    const t = $('.mauve__tree'); if (t && !reduce) t.style.transform = `translateY(${(y * .06) % 400}px) scale(1.12)`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* mobile nav */
  const burger = $('#burger'), nav = $('#nav');
  const setNav = (o) => { nav.classList.toggle('is-open', o); burger.setAttribute('aria-expanded', o); };
  burger.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setNav(false)));

  /* active link */
  const links = $$('a', nav);
  const secMap = { inicio: 'inicio', memoria: 'memoria', restauracion: 'memoria', propuesta: 'memoria', historia: 'memoria', experiencia: 'memoria', modelos: 'modelos', ubicacion: 'ubicacion', comunidad: 'ubicacion', dossier: 'dossier', contacto: 'contacto' };
  const spy = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return;
    const id = secMap[e.target.id];
    links.forEach(l => l.classList.toggle('is-on', l.getAttribute('href') === '#' + id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(secMap).forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });

  /* ---------- reveal + counters ---------- */
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in'); io.unobserve(e.target);
    $$('[data-count]', e.target).forEach(count);
  }), { threshold: .14 });
  $$('.reveal').forEach((el, i) => { el.style.setProperty('--d', (i % 5) * .08 + 's'); io.observe(el); });
  function count(el) {
    const to = +el.dataset.count; if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = (t) => { const p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  const mapIO = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); mapIO.disconnect(); } }), { threshold: .3 });
  mapIO.observe($('#map'));

  /* ---------- hero: luz que sigue al cursor ---------- */
  const hero = $('#inicio'), col = $('.hero__img--color');
  let tx = .5, ty = .55, cx = tx, cy = ty, rad = 0, tr = 0, auto = true, raf;
  const frame = () => {
    cx += (tx - cx) * .12; cy += (ty - cy) * .12; rad += (tr - rad) * .08;
    col.style.setProperty('--mx', cx * 100 + '%'); col.style.setProperty('--my', cy * 100 + '%'); col.style.setProperty('--rad', rad + 'px');
    raf = requestAnimationFrame(frame);
  };
  const big = () => Math.max(hero.clientWidth, hero.clientHeight) * .34;
  hero.addEventListener('pointermove', (e) => {
    auto = false; const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; tr = big();
    $('#heroHint').style.opacity = 0;
  });
  hero.addEventListener('pointerleave', () => { tr = auto ? tr : big() * .0; setTimeout(() => { if (!auto) tr = 0; }, 0); });
  if (!reduce) {
    frame();
    // En táctil / sin cursor: la luz se enciende sola y recorre la fachada.
    const t0 = performance.now();
    const drift = (t) => {
      if (auto) { const s = (t - t0) / 1000; if (s > 1.6) { tr = big() * 1.6; tx = .5 + Math.sin(s * .5) * .3; ty = .55 + Math.cos(s * .4) * .1; } }
      requestAnimationFrame(drift);
    };
    requestAnimationFrame(drift);
  } else { col.style.setProperty('--rad', '3000px'); }
  const heroParallax = () => { if (!reduce && scrollY < innerHeight) $('.hero__content').style.transform = `translateY(${scrollY * .18}px)`; };
  addEventListener('scroll', heroParallax, { passive: true });

  /* ---------- marco dorado: tilt ---------- */
  const fr = $('#frameWrap');
  if (fr && !reduce && matchMedia('(hover:hover)').matches) {
    fr.addEventListener('pointermove', (e) => { const r = fr.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; fr.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`; });
    fr.addEventListener('pointerleave', () => fr.style.transform = '');
  }

  /* ---------- comparador antes / después ---------- */
  const cmp = $('#compare'), hdl = $('#compareHandle');
  const setPos = (p) => { p = Math.max(0, Math.min(100, p)); cmp.style.setProperty('--pos', p + '%'); hdl.setAttribute('aria-valuenow', Math.round(p)); };
  let drag = false;
  const move = (e) => { const r = cmp.getBoundingClientRect(); setPos((e.clientX - r.left) / r.width * 100); };
  cmp.addEventListener('pointerdown', (e) => { drag = true; cmp.setPointerCapture(e.pointerId); move(e); });
  cmp.addEventListener('pointermove', (e) => drag && move(e));
  cmp.addEventListener('pointerup', () => drag = false);
  hdl.addEventListener('keydown', (e) => { const v = +hdl.getAttribute('aria-valuenow'); if (e.key === 'ArrowLeft') setPos(v - 5); if (e.key === 'ArrowRight') setPos(v + 5); });
  // demostración inicial
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting && !reduce) { o.disconnect(); let t0; const a = (t) => { t0 ??= t; const p = (t - t0) / 1800; if (p < 1 && !drag) { setPos(50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p)); requestAnimationFrame(a); } }; requestAnimationFrame(a); } }, { threshold: .6 }).observe(cmp);

  /* ---------- experiencia: tabs + estados de la terraza ---------- */
  const tabs = $$('.tabs [role=tab]'), panes = $$('.pane');
  const show = (k) => { tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.tab === k)); panes.forEach(p => p.classList.toggle('is-on', p.dataset.pane === k)); };
  tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.tab)));
  tabs.forEach((t, i) => t.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') tabs[(i + 1) % tabs.length].click(), tabs[(i + 1) % tabs.length].focus(); if (e.key === 'ArrowLeft') tabs[(i + tabs.length - 1) % tabs.length].click(), tabs[(i + tabs.length - 1) % tabs.length].focus(); }));
  const roof = $('#roofImg');
  $$('.moods button').forEach(b => b.addEventListener('click', () => {
    $$('.moods button').forEach(x => x.classList.toggle('is-on', x === b));
    roof.style.opacity = 0; setTimeout(() => { roof.src = b.dataset.roof; roof.onload = () => roof.style.opacity = 1; }, 250);
  }));

  /* ---------- modelos ---------- */
  const M = [
    { k: 'parota', n: 'Parota', m2: 45, r: 1, bg: '#fff5ec', d: ['Sala / comedor', 'Cocina', 'Área de lavado', '1 recámara', '1 baño'] },
    { k: 'wurzel', n: 'Wurzel', m2: 53, r: 1, bg: '#e6d4be', d: ['Sala / comedor', 'Cocina', 'Área de lavado', '1 recámara', '1 baño'] },
    { k: 'diana', n: 'Diana', m2: 57, r: 1, bg: '#d9c0bb', d: ['Sala / comedor', 'Cocina', 'Área de lavado', '1 recámara', '1 baño'] },
    { k: 'porthole', n: 'Porthole', m2: 58, r: 1, bg: '#b28b86', d: ['Sala / comedor', 'Cocina', 'Cuarto de lavado', '1 recámara', '1.5 baños'] },
    { k: 'deco', n: 'Deco', m2: 60, r: 1, bg: '#fff5eb', d: ['Sala / comedor', 'Cocina', 'Cuarto de lavado', '1 recámara', '1.5 baños'] },
    { k: 'art', n: 'Art', m2: 63, r: 1, bg: '#fff5eb', d: ['Sala / comedor', 'Cocina', 'Área de lavado', '1 recámara', '1.5 baños'] },
    { k: 'mondini', n: 'Mondini', m2: 67, r: 2, bg: '#b28b86', d: ['Sala / comedor', 'Cocina', 'Área de lavado', '2 recámaras', '2 baños'] },
    { k: 'schmidt', n: 'Schmidt', m2: 69, r: 2, bg: '#b28b86', d: ['Sala / comedor', 'Cocina', '2 recámaras', '2 baños', 'Cuarto de lavado'] },
    { k: 'cevallos', n: 'Cevallos', m2: 69, r: 2, bg: '#b28b86', d: ['Sala / comedor', 'Cocina', '2 recámaras', '2 baños', 'Cuarto de lavado'] },
    { k: 'freeman', n: 'Freeman', m2: 73, r: 2, bg: '#d9c0bb', d: ['Sala / comedor', 'Cocina', '2 recámaras', '2 baños', 'Cuarto de lavado'] },
    { k: 'mosaico', n: 'Mosaico', m2: 81, r: 2, bg: '#e6d4be', d: ['Sala / comedor', 'Cocina', '2 recámaras', '2 baños', 'Patio central'] },
    { k: 'goldschmidt', n: 'Goldschmidt', m2: 95, r: 2, bg: '#e6d4bc', d: ['Sala / comedor', 'Cocina', '2 recámaras', '1.5 baños'] },
    { k: 'delOro', n: 'Del Oro', sub: 'Penthouse', m2: 148, r: 3, ph: true, bg: '#a9b594', d: ['Sala', 'Comedor', 'Cocina', '3 recámaras', '3.5 baños', 'Terraza privada con vista'] }
  ];
  const ul = $('#cards');
  ul.innerHTML = M.map((m, i) => `<li class="card${m.ph ? ' card--ph' : ''}" data-i="${i}" style="--bg:${m.bg}"><button type="button" aria-label="Ver modelo ${m.n}${m.sub ? ' ' + m.sub : ''}, ${m.m2} metros cuadrados">
      <span class="card__plan"><img src="assets/img/plans/${m.k}.webp" alt="Plano del modelo ${m.n}" loading="lazy"></span>
      <span class="card__meta"><h3>${m.n}${m.sub ? '<br><small style="font-size:.55em;letter-spacing:.2em">' + m.sub + '</small>' : ''}<i>${m.m2} m²</i></h3><p>${m.d.filter(x => /recámara/.test(x)).join('')} · ${m.d.filter(x => /baño/.test(x)).join('')}</p></span></button></li>`).join('');
  let filter = 'all', max = 150;
  const apply = () => {
    let n = 0;
    $$('.card', ul).forEach(c => { const m = M[c.dataset.i]; const ok = (filter === 'all' || (filter === 'ph' ? m.ph : (!m.ph && String(m.r) === filter))) && m.m2 <= max; c.hidden = !ok; n += ok; });
    $('#cardsEmpty').hidden = n > 0;
  };
  $$('.chips button').forEach(b => b.addEventListener('click', () => { $$('.chips button').forEach(x => x.classList.toggle('is-on', x === b)); filter = b.dataset.f; apply(); }));
  $('#range').addEventListener('input', (e) => { max = +e.target.value; $('#rangeOut').textContent = max; apply(); });
  const modal = $('#modal');
  ul.addEventListener('click', (e) => {
    const li = e.target.closest('.card'); if (!li) return; const m = M[li.dataset.i];
    $('#mPlan').style.setProperty('--bg', m.bg); $('#mImg').src = `assets/img/plans/${m.k}.webp`; $('#mImg').alt = `Plano del modelo ${m.n}`;
    $('#mTitle').textContent = m.n + (m.sub ? ' ' + m.sub : ''); $('#mM2').textContent = m.m2 + ' m²';
    $('#mList').innerHTML = m.d.map(x => `<li>${x}</li>`).join('');
    $('#mCta').href = wa(`Hola, quiero la ficha técnica del modelo ${m.n}${m.sub ? ' ' + m.sub : ''} (${m.m2} m²) de ÁUREA Centro Histórico.`);
    modal.showModal();
  });
  const closeOnBackdrop = (d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  closeOnBackdrop(modal); $('#modalX').addEventListener('click', () => modal.close());

  /* lightbox */
  const lb = $('#lightbox');
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lb]'); if (!b) return;
    $('#lbImg').src = b.dataset.lb; $('#lbImg').alt = b.dataset.cap || ''; $('#lbCap').textContent = b.dataset.cap || ''; lb.showModal();
  });
  closeOnBackdrop(lb); $('#lbX').addEventListener('click', () => lb.close());

  /* ---------- mapa: puntos, rutas y lista ---------- */
  const setPoi = (k) => {
    $$('.poi[data-poi]').forEach(p => p.classList.toggle('is-on', p.dataset.poi === k));
    $$('.route').forEach(r => r.classList.toggle('is-on', r.dataset.poi === k));
    $$('#poi li').forEach(l => l.classList.toggle('is-on', l.dataset.poi === k));
  };
  $$('.poi[data-poi], #poi li').forEach(el => {
    ['mouseenter', 'focus', 'click'].forEach(ev => el.addEventListener(ev, () => setPoi(el.dataset.poi)));
  });
  $$('.poi[data-poi]').forEach(el => el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPoi(el.dataset.poi); } }));
  $('#map').addEventListener('mouseleave', () => setPoi(null));
  $('#poi').addEventListener('mouseleave', () => setPoi(null));

  /* ---------- propuesta de valor: paneles ---------- */
  const pv = $('#pv'), pvs = $$('.pv__p', pv), pvBar = $('#pvBar');
  let pvI = 0, pvTimer = null, pvPaused = false; const PV_T = 6500;
  const runBar = (bar, t) => { bar.classList.remove('run'); void bar.offsetWidth; bar.style.setProperty('--t', t + 'ms'); if (!pvPaused || bar !== pvBar) bar.classList.add('run'); };
  const setPv = (i, user) => {
    pvI = (i + pvs.length) % pvs.length;
    pvs.forEach((p, k) => { p.classList.toggle('is-on', k === pvI); p.setAttribute('aria-expanded', k === pvI); });
    clearTimeout(pvTimer);
    if (!reduce && !pvPaused) { runBar(pvBar, PV_T); pvTimer = setTimeout(() => setPv(pvI + 1), PV_T); }
  };
  pvs.forEach((p, k) => {
    p.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) setPv(k, true); });
    p.addEventListener('click', () => setPv(k, true));
    p.addEventListener('focus', () => setPv(k, true));
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPv(k, true); } if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pvs[(k + 1) % pvs.length].focus(); } if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pvs[(k + pvs.length - 1) % pvs.length].focus(); } });
    p.addEventListener('pointermove', (e) => { const r = p.getBoundingClientRect(); p.style.setProperty('--mx', (e.clientX - r.left) + 'px'); p.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  pv.addEventListener('mouseenter', () => { pvPaused = true; clearTimeout(pvTimer); pvBar.classList.remove('run'); pvBar.style.transform = 'scaleX(0)'; });
  pv.addEventListener('mouseleave', () => { pvPaused = false; setPv(pvI); });
  // arranca el ciclo solo cuando la sección es visible
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); setPv(0); } }, { threshold: .35 }).observe(pv);
  const mark = $('.pv__mark');
  addEventListener('scroll', () => { if (!reduce && mark) { const r = $('#propuesta').getBoundingClientRect(); mark.style.setProperty('--rot', (-8 + (r.top / innerHeight) * 10) + 'deg'); } }, { passive: true });

  /* ---------- carrusel del Centro Histórico ---------- */
  const car = $('#car'), cs = $$('.car__s', car), dots = $('#carDots'), cBar = $('#carBar');
  const C_T = 6000; let cI = 0, cTimer = null, cHover = false;
  cs.forEach((_, k) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Ir a la imagen ' + (k + 1)); b.addEventListener('click', () => setCar(k)); dots.appendChild(b); });
  const setCar = (i) => {
    cI = (i + cs.length) % cs.length;
    cs.forEach((s, k) => s.classList.toggle('is-on', k === cI));
    $$('button', dots).forEach((b, k) => b.classList.toggle('is-on', k === cI));
    $('#carCount').textContent = String(cI + 1).padStart(2, '0') + ' / ' + String(cs.length).padStart(2, '0');
    clearTimeout(cTimer); cBar.classList.remove('run'); void cBar.offsetWidth;
    if (!reduce && !cHover) { cBar.style.setProperty('--t', C_T + 'ms'); cBar.classList.add('run'); cTimer = setTimeout(() => setCar(cI + 1), C_T); }
  };
  $('#carPrev').addEventListener('click', () => setCar(cI - 1));
  $('#carNext').addEventListener('click', () => setCar(cI + 1));
  car.addEventListener('mouseenter', () => { cHover = true; clearTimeout(cTimer); cBar.classList.remove('run'); });
  car.addEventListener('mouseleave', () => { cHover = false; setCar(cI); });
  let tx0 = null; car.addEventListener('touchstart', (e) => tx0 = e.touches[0].clientX, { passive: true });
  car.addEventListener('touchend', (e) => { if (tx0 === null) return; const dx = e.changedTouches[0].clientX - tx0; if (Math.abs(dx) > 40) setCar(cI + (dx < 0 ? 1 : -1)); tx0 = null; });
  setCar(0);

  /* ---------- dossier + contacto (WhatsApp, sin backend) ---------- */
  $('#dossierBtn').href = wa('Hola, me gustaría recibir el dossier de ÁUREA Centro Histórico.');
  const form = $('#form'), note = $('#formNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form), nombre = (f.get('nombre') || '').trim(), tel = (f.get('tel') || '').trim();
    $$('input', form).forEach(i => i.classList.remove('is-bad'));
    if (!nombre || tel.replace(/\D/g, '').length < 8) {
      if (!nombre) form.nombre.classList.add('is-bad'); if (tel.replace(/\D/g, '').length < 8) form.tel.classList.add('is-bad');
      note.textContent = 'Por favor completa tu nombre y un teléfono válido.'; return;
    }
    const txt = `Hola, soy ${nombre}. Me interesa: ${f.get('interes')}.${f.get('msg') ? ' ' + f.get('msg').trim() : ''} Mi teléfono: ${tel}${f.get('email') ? ', correo: ' + f.get('email') : ''}.`;
    note.textContent = 'Abriendo WhatsApp con tu mensaje…';
    window.open(wa(txt), '_blank', 'noopener');
    form.reset();
  });
})();
