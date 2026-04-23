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

  /* ── Curseur personnalisé ── */
  const cursor = document.getElementById('cursor');
  const isFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;

  if (cursor && isFinePointer) {
    let revealed = false;

    document.addEventListener('mousemove', e => {
      cursor.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
      if (!revealed) {
        cursor.style.opacity = '1';
        revealed = true;
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { if (revealed) cursor.style.opacity = '1'; });

    /* FIX plein écran : masquer le point custom en fullscreen (le navigateur
       force cursor:auto, le point resterait superposé et décalé) */
    const onFullscreenChange = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      cursor.style.opacity = isFs ? '0' : (revealed ? '1' : '0');
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    document.querySelectorAll('a, button, .fb, .pc, .feat-item, .score-card, .cr').forEach(el => {
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

  /* ════════════════════════════════════════════════════════════════
     LIGHTBOX
     — Auto-tag : images dans .mp-item, .mg-item, .media-posts, .media-grid
     — S'active sur toutes les images portant l'attribut data-lightbox
     — Navigation clavier (←/→/Esc) + swipe tactile
     — Se ferme en cliquant sur le fond ou sur ✕
     — z-index sous le curseur, au-dessus de tout le reste
  ════════════════════════════════════════════════════════════════ */
  (function initLightbox() {

    /* ── Auto-tag : ajoute data-lightbox sur toutes les images visuelles ── */
    document.querySelectorAll(
      '.mp-item img, .mg-item img, .mm-item img, .media-posts img, .media-grid img'
    ).forEach(img => {
      /* Masquer proprement les images cassées (fichier absent) */
      if (!img.onerror) {
        img.addEventListener('error', () => {
          const parent = img.closest('.mp-item, .mg-item, .mm-item');
          if (parent) parent.style.display = 'none';
        });
      }
      if (!img.hasAttribute('data-lightbox')) {
        img.setAttribute('data-lightbox', '');
      }
    });

    /* Injection des styles (une seule fois) */
    const style = document.createElement('style');
    style.textContent = `
      .lb {
        position: fixed;
        inset: 0;
        z-index: 2147483640;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0);
        backdrop-filter: blur(0px);
        -webkit-backdrop-filter: blur(0px);
        transition: background .3s ease, backdrop-filter .3s ease;
        pointer-events: none;
      }
      .lb.lb-open {
        background: rgba(0, 0, 0, .88);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        pointer-events: all;
      }

      .lb-img {
        max-width: min(90vw, 1200px);
        max-height: 85vh;
        width: auto;
        height: auto;
        border-radius: 4px;
        object-fit: contain;
        opacity: 0;
        transform: scale(.96);
        transition: opacity .3s ease, transform .3s var(--ease, cubic-bezier(.22,1,.36,1));
        display: block;
        pointer-events: none;
        user-select: none;
        /* Jamais de texte alt visible dans la lightbox */
        font-size: 0 !important;
        color: transparent !important;
      }

      .lb-close {
        position: absolute;
        top: 1.2rem;
        right: 1.2rem;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 50%;
        color: #f0f0f0;
        font-size: 1.1rem;
        cursor: pointer;
        line-height: 1;
        opacity: 0;
        transition: opacity .3s ease, background .2s, transform .2s;
      }
      .lb.lb-open .lb-close { opacity: 1; }
      .lb-close:hover { background: rgba(255,255,255,.18); transform: scale(1.1); }

      .lb-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 50%;
        color: #f0f0f0;
        cursor: pointer;
        opacity: 0;
        pointer-events: none;
        transition: opacity .3s ease, background .2s;
      }
      .lb.lb-open .lb-arrow { opacity: 1; pointer-events: all; }
      .lb-arrow:hover { background: rgba(255,255,255,.18); }
      .lb-arrow.lb-prev { left: 1.2rem; }
      .lb-arrow.lb-next { right: 4.2rem; }
      .lb-arrow svg { pointer-events: none; }
      .lb-arrow.lb-hidden { opacity: 0 !important; pointer-events: none !important; }

      .lb-counter {
        position: absolute;
        bottom: 1.2rem;
        left: 50%;
        transform: translateX(-50%);
        font-family: var(--f-mono, monospace);
        font-size: .62rem;
        letter-spacing: .14em;
        color: rgba(255,255,255,.4);
        opacity: 0;
        transition: opacity .3s ease;
        white-space: nowrap;
      }
      .lb.lb-open .lb-counter { opacity: 1; }
      .lb-counter.lb-single { display: none; }

      .lb-caption {
        position: absolute;
        bottom: 2.8rem;
        left: 50%;
        transform: translateX(-50%);
        font-family: var(--f-mono, monospace);
        font-size: .65rem;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: rgba(255,255,255,.5);
        opacity: 0;
        transition: opacity .3s ease;
        white-space: nowrap;
        max-width: 80vw;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .lb.lb-open .lb-caption { opacity: 1; }

      [data-lightbox] { cursor: zoom-in; }
    `;
    document.head.appendChild(style);

    /* Structure DOM de la lightbox */
    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image agrandie');
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML = `
      <button class="lb-close" aria-label="Fermer">✕</button>
      <button class="lb-arrow lb-prev" aria-label="Image précédente">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4l-5 5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <img class="lb-img" src="" alt="" />
      <button class="lb-arrow lb-next" aria-label="Image suivante">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="lb-caption"></div>
      <div class="lb-counter"></div>
    `;
    document.body.appendChild(lb);

    const lbImg     = lb.querySelector('.lb-img');
    const lbClose   = lb.querySelector('.lb-close');
    const lbPrev    = lb.querySelector('.lb-prev');
    const lbNext    = lb.querySelector('.lb-next');
    const lbCaption = lb.querySelector('.lb-caption');
    const lbCounter = lb.querySelector('.lb-counter');

    let images = [];
    let current = 0;

    function collectImages() {
      images = Array.from(document.querySelectorAll('img[data-lightbox]'));
    }

    function show(idx) {
      if (!images.length) return;
      current = (idx + images.length) % images.length;
      const img = images[current];

      lbImg.style.opacity = '0';
      lbImg.style.transform = 'scale(.96)';

      lbImg.onload = () => {
        lbImg.style.opacity = '1';
        lbImg.style.transform = 'scale(1)';
      };
      lbImg.src = img.src;
      /* Si l'image est déjà en cache, onload ne se déclenche pas → forcer */
      if (lbImg.complete && lbImg.naturalWidth > 0) {
        lbImg.style.opacity = '1';
        lbImg.style.transform = 'scale(1)';
      }
      lbImg.alt = img.alt || '';

      /* Caption uniquement si data-caption est défini — jamais l'alt en fallback */
      lbCaption.textContent = img.dataset.caption || '';
      lbCaption.style.display = img.dataset.caption ? '' : 'none';

      if (images.length > 1) {
        lbCounter.textContent = `${current + 1} / ${images.length}`;
        lbCounter.classList.remove('lb-single');
        lbPrev.classList.remove('lb-hidden');
        lbNext.classList.remove('lb-hidden');
      } else {
        lbCounter.classList.add('lb-single');
        lbPrev.classList.add('lb-hidden');
        lbNext.classList.add('lb-hidden');
      }
    }

    function open(idx) {
      collectImages();
      show(idx);
      lb.classList.add('lb-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lb.classList.remove('lb-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      /* Vider src ET alt après la transition pour éviter tout texte fantôme */
      setTimeout(() => {
        lbImg.src = '';
        lbImg.alt = '';
      }, 320);
    }

    document.addEventListener('click', e => {
      const img = e.target.closest('img[data-lightbox]');
      if (!img) return;
      collectImages();
      const idx = images.indexOf(img);
      open(idx >= 0 ? idx : 0);
    });

    lbClose.addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    lbPrev.addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
    lbNext.addEventListener('click', e => { e.stopPropagation(); show(current + 1); });

    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('lb-open')) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowLeft')   show(current - 1);
      if (e.key === 'ArrowRight')  show(current + 1);
    });

    let touchStartX = 0;
    lb.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 40) return;
      dx < 0 ? show(current + 1) : show(current - 1);
    }, { passive: true });

  })(); /* fin initLightbox */

})();