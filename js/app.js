/* ============================================================
   PORTFOLIO — app.js  |  Maxime Bourgeot
   Script unifié (remplace main.js ET project.js)
   - Null checks sur chaque élément DOM avant usage
   - Pas de double déclaration entre les deux anciens fichiers
   - defer sur la balise <script> → pas besoin de DOMContentLoaded
============================================================ */
(function () {
  'use strict';

  /* ── Année courante ── */
  const now = new Date();
  document.querySelectorAll('#current-year, #footer-year')
    .forEach(el => (el.textContent = now.getFullYear()));

  /* ── Âge (index uniquement) ── */
  const ageEl = document.getElementById('age-display');
  if (ageEl) {
    const birth = new Date(2004, 10, 26);
    let age = now.getFullYear() - birth.getFullYear();
    if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--;
    ageEl.textContent = age + ' ans';
  }

  /* ── Progress bar ── */
  const progressEl = document.getElementById('progress');
  if (progressEl) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const pct = (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100;
      progressEl.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── Curseur personnalisé (pointer: fine uniquement) ── */
  const cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    cursor.style.display = 'block';
    let mx = -100, my = -100, cx = -100, cy = -100;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      cx += (mx - cx);
      cy += (my - cy);
      cursor.style.transform = `translate(calc(${cx}px - 50%), calc(${cy}px - 50%))`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
    document.querySelectorAll('a, button, .fb, .pc').forEach(el => {
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

  /* ── Active nav link au scroll (index seulement) ── */
  const sections = document.querySelectorAll('section[id]');
  const navAs    = document.querySelectorAll('.nav-links a');
  if (sections.length && navAs.length) {
    sections.forEach(s =>
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting)
            navAs.forEach(a =>
              a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`)
            );
        });
      }, { threshold: 0.4 }).observe(s)
    );
  }

  /* ── Hamburger menu mobile ── */
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

  /* ── Filtre projets (index seulement) ── */
  const fBtns = document.querySelectorAll('.fb');
  const cards = document.querySelectorAll('.pc');
  if (fBtns.length && cards.length) {
    fBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        fBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        const filter = btn.dataset.filter;
        let delay = 0;

        cards.forEach(card => {
          const match = filter === 'all' || card.dataset.cat === filter;
          if (match) {
            card.classList.remove('hidden');
            card.style.transitionDelay = `${delay}ms`;
            delay += 40;
            requestAnimationFrame(() => requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'none';
            }));
          } else {
            card.style.transitionDelay = '0ms';
            card.style.opacity = '0';
            card.style.transform = 'translateY(6px)';
            setTimeout(() => card.classList.add('hidden'), 240);
          }
        });
      });
    });
  }

  /* ── Smooth anchor scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMobile();
      const top = target.getBoundingClientRect().top + window.scrollY - (nav?.offsetHeight ?? 60);
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Toast ── */
  const toast = document.getElementById('toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2400);
  }

  /* ── Copier l'email au clic ── */
  const copyEl = document.getElementById('copy-email');
  if (copyEl && navigator.clipboard) {
    copyEl.addEventListener('click', e => {
      e.preventDefault();
      navigator.clipboard.writeText(copyEl.dataset.copy)
        .then(() => showToast('Email copié ✓'))
        .catch(() => { window.location.href = copyEl.href; });
    });
  }

})();