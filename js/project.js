/* ============================================================
   PROJECT PAGE — project.js  |  Maxime Bourgeot
   Script partagé par toutes les pages projet
============================================================ */
(function () {
  'use strict';

  /* ── Année ── */
  const now = new Date();
  document.querySelectorAll('#current-year, #footer-year')
    .forEach(el => (el.textContent = now.getFullYear()));

  /* ── Progress bar ── */
  const progressEl = document.getElementById('progress');
  if (progressEl) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const pct = (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100;
      progressEl.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── Cursor ── */
  const cursor = document.getElementById('cursor');
  const isFine = window.matchMedia('(pointer: fine)').matches;
  if (cursor && isFine) {
    cursor.style.display = 'block';
    let mx = -100, my = -100, cx = -100, cy = -100;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      cx += (mx - cx) * 1;
      cy += (my - cy) * 1;
      cursor.style.transform = `translate(calc(${cx}px - 50%), calc(${cy}px - 50%))`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
    });
  }

  /* ── Nav scroll ── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Hamburger (mobile) ── */
  const burger  = document.getElementById('nav-burger');
  const overlay = document.getElementById('mobile-overlay');

  const closeMobile = () => {
    if (!burger || !overlay) return;
    burger.classList.remove('open');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (burger && overlay) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      overlay.classList.toggle('open', open);
      overlay.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });
  }

  /* ── Scroll reveal ── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

})();