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
    const updateProgress = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progressEl.style.width = Math.min(pct, 100) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ── Curseur personnalisé
     FIX : le CSS met désormais display:block + opacity:0 par défaut.
     On révèle le curseur (opacity:1) uniquement au premier mousemove
     pour éviter le flash en position (0,0) au chargement.
     Sur tactile (pointer:coarse) le CSS masque déjà avec display:none !important.
  ── */
  const cursor = document.getElementById('cursor');
  const isFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;

  if (cursor && isFinePointer) {
    let revealed = false;

    document.addEventListener('mousemove', e => {
      /* Positionner avant de révéler → zéro flash */
      cursor.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
      if (!revealed) {
        cursor.style.opacity = '1';
        revealed = true;
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { if (revealed) cursor.style.opacity = '1'; });

    document.querySelectorAll('a, button, .fb, .pc, .feat-item, .score-card, .cr').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
    });
  }
  /* Pas besoin de else : le CSS gère déjà display:none sur tactile */

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
    const sectionObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navAs.forEach(a =>
            a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`)
          );
        }
      });
    }, { threshold: 0.35, rootMargin: '-60px 0px 0px 0px' });

    sections.forEach(s => sectionObs.observe(s));
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
      const isOpen = burger.classList.toggle('open');
      overlay.classList.toggle('open', isOpen);
      overlay.setAttribute('aria-hidden', String(!isOpen));
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMobile();
    });

    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeMobile();
    });
  }

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach(el => revealObs.observe(el));
  }

  /* ── Filtre projets (index seulement) ── */
  const fBtns = document.querySelectorAll('.fb');
  const cards = document.querySelectorAll('.pc');

  if (fBtns.length && cards.length) {
    fBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        fBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
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
    const hash = a.getAttribute('href');
    if (!hash || hash === '#') return;

    a.addEventListener('click', e => {
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      closeMobile();
      const navH = nav ? nav.offsetHeight : 60;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
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
  if (copyEl) {
    copyEl.addEventListener('click', e => {
      e.preventDefault();
      const email = copyEl.dataset.copy || copyEl.href.replace('mailto:', '');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email)
          .then(() => showToast('Email copié ✓'))
          .catch(() => { window.location.href = copyEl.href; });
      } else {
        window.location.href = copyEl.href;
      }
    });
  }

})();