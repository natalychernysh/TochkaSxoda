(function () {
  /* Подставляет фото из js/images.js (меняй только images.js) */
  function renderHeroTags() {
    const root = document.getElementById('hero-tags');
    if (!root) return;

    const collage = window.SITE_IMAGES?.heroCollage;
    if (collage?.src) {
      root.className = 'hero-collage';
      const link = document.createElement('a');
      link.href = collage.link || '#portfolio';
      link.className = 'hero-collage__link';

      const rig = document.createElement('span');
      rig.className = 'hero-collage__rig';
      if (collage.height) rig.style.setProperty('--collage-h', collage.height);
      else if (collage.maxHeight) rig.style.setProperty('--collage-max-h', collage.maxHeight);
      if (collage.sway) rig.style.setProperty('--sway', collage.sway);

      const collageWrap = root.closest('.hero__collage');
      if (collageWrap) {
        if (collage.lift) collageWrap.style.setProperty('--collage-lift', collage.lift);
        if (collage.height) collageWrap.style.setProperty('--collage-h', collage.height);
      }

      const img = document.createElement('img');
      img.className = 'hero-collage__img';
      img.src = collage.src;
      img.alt = collage.alt || '';
      img.loading = 'eager';
      img.decoding = 'async';

      rig.appendChild(img);
      link.appendChild(rig);
      root.appendChild(link);
      return;
    }

    const tags = window.SITE_IMAGES?.heroTags;
    if (!tags?.length) return;

    tags.forEach(function (tag) {
      const link = document.createElement('a');
      link.href = tag.link || '#case-' + tag.id;
      link.className = 'hero-tag hero-tag--' + (tag.variant || 'default');
      link.style.setProperty('--cord', tag.cord || '2.5rem');
      link.style.setProperty('--delay', tag.delay || '0s');
      link.style.setProperty('--sway', tag.sway || '2deg');
      if (tag.cordColor) link.style.setProperty('--cord-color', tag.cordColor);
      if (tag.width) link.style.setProperty('--tag-width', tag.width);
      if (tag.height) link.style.setProperty('--tag-height', tag.height);
      if (tag.maxHeight) link.style.setProperty('--tag-max-height', tag.maxHeight);
      if (tag.frameWidth) link.style.setProperty('--tag-frame-w', tag.frameWidth);
      if (tag.frameHeight) link.style.setProperty('--tag-frame-h', tag.frameHeight);

      const rig = document.createElement('span');
      rig.className = 'hero-tag__rig';

      const fullUnit = Boolean(tag.fullUnit);

      if (!fullUnit) {
        const cord = document.createElement('span');
        cord.className = 'hero-tag__cord';
        cord.setAttribute('aria-hidden', 'true');

        const eyelet = document.createElement('span');
        eyelet.className = 'hero-tag__eyelet';
        eyelet.setAttribute('aria-hidden', 'true');

        rig.appendChild(cord);
        rig.appendChild(eyelet);
      }

      let mount = rig;
      if (tag.frame) {
        const frame = document.createElement('span');
        frame.className = 'hero-tag__frame';
        rig.appendChild(frame);
        mount = frame;
      }

      const img = document.createElement('img');
      img.className = 'hero-tag__img'
        + (tag.knockout ? ' hero-tag__img--knockout' : '');
      img.src = tag.src;
      img.alt = tag.alt || '';
      img.loading = 'eager';
      img.decoding = 'async';
      img.addEventListener('error', function () {
        link.classList.add('hero-tag--missing');
      });

      mount.appendChild(img);
      link.appendChild(rig);
      root.appendChild(link);
    });
  }

  function applySiteImages() {
    const data = window.SITE_IMAGES;
    if (!data) return;

    (data.portfolio || []).forEach(function (item) {
      const card = document.querySelector('[data-case="' + item.id + '"]');
      if (!card) return;
      const img = card.querySelector('.portfolio-card__media img');
      if (img) {
        const cover = item.cover || item.src;
        if (cover) img.src = cover;
        if (item.alt) img.alt = item.alt;
        if (item.focus) img.style.objectPosition = item.focus;
      }
      const media = card.querySelector('.portfolio-card__media');
      if (media) {
        if (item.fit === 'contain') media.classList.add('media-cell--contain');
        else media.classList.remove('media-cell--contain');
      }
      const tag = card.querySelector('.portfolio-card__tag');
      const title = card.querySelector('h3');
      const desc = card.querySelector('.portfolio-card__body p');
      if (tag && item.tag) tag.textContent = item.tag;
      if (title && item.title) title.textContent = item.title;
      if (desc && item.desc) desc.textContent = item.desc;
      if (item.title) card.setAttribute('aria-label', 'Открыть кейс: ' + item.title);
    });
  }

  function initPortfolioModal() {
    const modal = document.getElementById('portfolio-modal');
    const viewport = document.getElementById('portfolio-modal-viewport');
    const imgEl = document.getElementById('portfolio-modal-img');
    const titleEl = document.getElementById('portfolio-modal-title');
    const tagEl = document.getElementById('portfolio-modal-tag');
    const currentEl = document.getElementById('portfolio-modal-current');
    const totalEl = document.getElementById('portfolio-modal-total');
    const dotsEl = document.getElementById('portfolio-modal-dots');
    const prevBtn = document.querySelector('[data-portfolio-prev]');
    const nextBtn = document.querySelector('[data-portfolio-next]');
    const portfolio = window.SITE_IMAGES?.portfolio || [];
    const byId = {};
    portfolio.forEach(function (item) { byId[item.id] = item; });

    let active = null;
    let index = 0;

    function renderSlide() {
      if (!active || !active.gallery?.length) return;
      const total = active.gallery.length;
      const src = active.gallery[index];
      imgEl.src = src;
      imgEl.alt = (active.title || '') + ' — фото ' + (index + 1);
      currentEl.textContent = String(index + 1);
      totalEl.textContent = String(total);
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= total - 1;
      dotsEl.querySelectorAll('.portfolio-modal__dot').forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }

    function setAspect() {
      if (!viewport) return;
      viewport.classList.toggle('portfolio-modal__viewport--43', active?.galleryAspect === '4/3');
    }

    function buildDots() {
      dotsEl.innerHTML = '';
      if (!active?.gallery) return;
      active.gallery.forEach(function (_, i) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'portfolio-modal__dot' + (i === index ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Фото ' + (i + 1));
        dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
        dot.addEventListener('click', function () {
          index = i;
          renderSlide();
        });
        dotsEl.appendChild(dot);
      });
    }

    function openModal(id, startIndex) {
      const item = byId[id];
      if (!item?.gallery?.length || !modal) return;
      active = item;
      index = typeof startIndex === 'number' ? startIndex : 0;
      if (titleEl) titleEl.textContent = item.title || '';
      if (tagEl) tagEl.textContent = item.tag || '';
      setAspect();
      buildDots();
      renderSlide();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('portfolio-modal-open');
      modal.querySelector('.portfolio-modal__close')?.focus();
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('portfolio-modal-open');
      imgEl.removeAttribute('src');
      active = null;
    }

    function step(delta) {
      if (!active?.gallery) return;
      index = Math.max(0, Math.min(active.gallery.length - 1, index + delta));
      renderSlide();
    }

    document.querySelectorAll('.portfolio-card--open').forEach(function (card) {
      const id = card.getAttribute('data-case');
      function open() { openModal(id, 0); }
      card.addEventListener('click', open);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });

    prevBtn?.addEventListener('click', function () { step(-1); });
    nextBtn?.addEventListener('click', function () { step(1); });

    modal?.querySelectorAll('[data-portfolio-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function (e) {
      if (!modal?.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    return {
      open: openModal,
      close: closeModal
    };
  }

  renderHeroTags();
  applySiteImages();
  const portfolioModal = initPortfolioModal();

  function focusPortfolioCase() {
    const hash = window.location.hash;
    if (!hash) return;
    if (hash === '#portfolio') return;
    if (!hash.startsWith('#case-')) return;
    const id = hash.replace('#case-', '');
    const card = document.querySelector(hash);
    if (card) {
      card.classList.add('portfolio-card--focus');
      window.setTimeout(function () {
        card.classList.remove('portfolio-card--focus');
      }, 2200);
    }
    if (portfolioModal) portfolioModal.open(id, 0);
  }

  window.addEventListener('hashchange', focusPortfolioCase);
  focusPortfolioCase();

  const header = document.querySelector('.header');
  const drawer = document.querySelector('.nav-drawer');
  const drawerToggle = document.querySelector('[data-drawer-toggle]');
  const drawerClose = document.querySelectorAll('[data-drawer-close]');
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const progressBar = document.querySelector('.scroll-progress');

  const wavesOpts = {
    lineColor: 'rgba(90, 70, 60, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    waveSpeedX: 0.01,
    waveSpeedY: 0.01,
    waveAmpX: 40,
    waveAmpY: 20,
    friction: 0.9,
    tension: 0.01,
    maxCursorMove: 120,
    xGap: 12,
    yGap: 36
  };

  const wavesContact = document.getElementById('waves-contact');
  if (wavesContact && window.Waves) {
    new window.Waves(wavesContact, {
      ...wavesOpts,
      lineColor: 'rgba(224, 99, 40, 0.2)',
      backgroundColor: 'transparent',
      waveAmpX: 24,
      waveAmpY: 12
    });
  }

  window.addEventListener('scroll', function () {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
    if (progressBar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = h > 0 ? (window.scrollY / h) * 100 + '%' : '0%';
    }
  }, { passive: true });

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    drawerToggle?.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('drawer-open', open);
  }

  drawerToggle?.addEventListener('click', function () {
    setDrawer(!drawer.classList.contains('is-open'));
  });

  drawerClose.forEach(function (el) {
    el.addEventListener('click', function () { setDrawer(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setDrawer(false);
  });

  const tabBtns = document.querySelectorAll('[data-dir-tab]');
  const tabPanels = document.querySelectorAll('[data-dir-panel]');

  function activateTab(id) {
    tabBtns.forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-dir-tab') === id);
    });
    tabPanels.forEach(function (p) {
      p.classList.toggle('is-active', p.getAttribute('data-dir-panel') === id);
    });
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activateTab(btn.getAttribute('data-dir-tab'));
    });
  });

  function syncTabFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (['marketing-branding', 'marketplaces', 'web-automation'].includes(hash)) {
      activateTab(hash);
      const directions = document.getElementById('directions');
      if (directions) directions.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  window.addEventListener('hashchange', syncTabFromHash);
  syncTabFromHash();

  const sections = document.querySelectorAll('main section[id]');

  if ('IntersectionObserver' in window && sections.length) {
    const spyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(function (link) {
          const match = link.getAttribute('href') === '#' + id;
          link.classList.toggle('is-active', match);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(function (s) { spyObs.observe(s); });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () { setDrawer(false); });
  });

  function scrollToHome() {
    const hero = document.getElementById('hero');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (history.replaceState) {
      history.replaceState(null, '', '#hero');
    } else {
      window.location.hash = 'hero';
    }
    setDrawer(false);
  }

  document.querySelectorAll('[data-home-link]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      scrollToHome();
    });
  });

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
