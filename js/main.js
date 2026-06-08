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

  function renderPortfolioGrid() {
    const grid = document.getElementById('portfolio-grid');
    const data = window.SITE_IMAGES?.portfolio;
    if (!grid || !data?.length) return;

    grid.innerHTML = '';
    data.forEach(function (item) {
      const article = document.createElement('article');
      article.className = 'portfolio-card reveal portfolio-card--open is-visible';
      article.id = 'case-' + item.id;
      article.setAttribute('data-case', item.id);
      article.tabIndex = 0;
      article.role = 'button';
      article.setAttribute('aria-label', 'Открыть кейс: ' + (item.title || item.id));

      const cover = item.cover || (item.folder ? 'assets/' + item.folder + '/Превью.png' : '');
      const media = document.createElement('div');
      media.className = 'portfolio-card__media';
      if (item.fit === 'contain') media.classList.add('media-cell--contain');

      const img = document.createElement('img');
      img.src = cover;
      img.alt = item.alt || item.title || '';
      img.width = 800;
      img.height = 600;
      img.loading = 'lazy';
      if (item.focus) img.style.objectPosition = item.focus;
      media.appendChild(img);

      const body = document.createElement('div');
      body.className = 'portfolio-card__body';
      body.innerHTML =
        '<span class="portfolio-card__tag">' + (item.tag || '') + '</span>' +
        '<h3>' + (item.title || '') + '</h3>' +
        '<p>' + (item.desc || '') + '</p>';

      article.appendChild(media);
      article.appendChild(body);
      grid.appendChild(article);
    });
  }

  function applySiteImages() {
    renderPortfolioGrid();
  }

  function applyContactData() {
    const contact = window.SITE_IMAGES?.texts?.contact;
    if (!contact) return;

    const section = document.getElementById('contact');
    if (!section) return;

    function setText(sel, val) {
      if (!val) return;
      const el = section.querySelector(sel);
      if (el) el.textContent = val;
    }

    setText('.section-title', contact.title);
    setText('.contact__text', contact.text);

    function contactActions() {
      if (Array.isArray(contact.actions) && contact.actions.length) return contact.actions;
      const legacy = [];
      if (contact.telegramUrl || contact.telegramLabel) {
        legacy.push({
          label: contact.telegramLabel || 'Telegram →',
          href: contact.telegramUrl || '#',
          primary: true
        });
      }
      if (contact.callUrl || contact.callLabel) {
        legacy.push({
          label: contact.callLabel || 'Созвон',
          href: contact.callUrl || '#contact',
          primary: false
        });
      }
      return legacy;
    }

    const actionsRoot = document.getElementById('contact-actions');
    if (actionsRoot) {
      actionsRoot.innerHTML = '';
      contactActions().forEach(function (action) {
        if (!action?.href || !action?.label) return;
        const a = document.createElement('a');
        a.href = action.href;
        a.textContent = action.label;
        a.className = 'btn ' + (action.primary ? 'btn--primary' : 'btn--ghost btn--light');
        if (!/^tel:|^mailto:|^#/.test(action.href)) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        actionsRoot.appendChild(a);
      });
    }

    const linksRoot = document.getElementById('contact-links');
    if (linksRoot && Array.isArray(contact.links)) {
      linksRoot.innerHTML = '';
      contact.links.forEach(function (link) {
        if (!link?.href || !link?.label) return;
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.label;
        if (link.external !== false && !/^tel:|^mailto:|^#/.test(link.href)) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        linksRoot.appendChild(a);
      });
    }
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
    const grid = document.getElementById('portfolio-grid');

    let active = null;
    let index = 0;

    function getItem(id) {
      return (window.SITE_IMAGES?.portfolio || []).find(function (item) {
        return item.id === id;
      });
    }

    function renderSlide() {
      if (!active?.gallery?.length || !imgEl) return;
      const total = active.gallery.length;
      const src = active.gallery[index];
      if (!src) return;
      if (imgEl.getAttribute('src') !== src) imgEl.setAttribute('src', src);
      imgEl.alt = (active.title || '') + ' — фото ' + (index + 1);
      if (currentEl) currentEl.textContent = String(index + 1);
      if (totalEl) totalEl.textContent = String(total);
      if (dotsEl) {
        dotsEl.querySelectorAll('.portfolio-modal__dot').forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
          dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
        });
      }
      const prevBtn = modal?.querySelector('[data-portfolio-prev]');
      const nextBtn = modal?.querySelector('[data-portfolio-next]');
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= total - 1;
    }

    function setAspect() {
      if (!viewport) return;
      viewport.classList.toggle('portfolio-modal__viewport--43', active?.galleryAspect === '4/3');
    }

    function buildDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      if (!active?.gallery) return;
      active.gallery.forEach(function (_, i) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'portfolio-modal__dot' + (i === index ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Фото ' + (i + 1));
        dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
        dot.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          index = i;
          renderSlide();
        });
        dotsEl.appendChild(dot);
      });
    }

    function openModal(id, startIndex) {
      const item = getItem(id);
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
      if (imgEl) imgEl.removeAttribute('src');
      active = null;
      index = 0;
    }

    function step(delta) {
      if (!active?.gallery?.length) return;
      index = Math.max(0, Math.min(active.gallery.length - 1, index + delta));
      renderSlide();
    }

    if (grid && !grid.dataset.modalBound) {
      grid.dataset.modalBound = '1';
      grid.addEventListener('click', function (e) {
        const card = e.target.closest('.portfolio-card--open');
        if (!card) return;
        openModal(card.getAttribute('data-case'), 0);
      });
      grid.addEventListener('keydown', function (e) {
        const card = e.target.closest('.portfolio-card--open');
        if (!card) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(card.getAttribute('data-case'), 0);
        }
      });
    }

    if (modal && !modal.dataset.modalBound) {
      modal.dataset.modalBound = '1';

      modal.addEventListener('click', function (e) {
        if (!modal.classList.contains('is-open')) return;
        if (e.target.closest('[data-portfolio-prev]')) {
          e.preventDefault();
          e.stopPropagation();
          step(-1);
          return;
        }
        if (e.target.closest('[data-portfolio-next]')) {
          e.preventDefault();
          e.stopPropagation();
          step(1);
          return;
        }
        if (e.target.closest('[data-portfolio-close]')) {
          e.preventDefault();
          closeModal();
        }
      });

      document.addEventListener('keydown', function (e) {
        if (!modal.classList.contains('is-open')) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          closeModal();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          step(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          step(1);
        }
      });
    }

    return {
      open: openModal,
      close: closeModal
    };
  }

  function applySiteTexts() {
    const texts = window.SITE_IMAGES?.texts;
    if (!texts) return;

    function setText(sel, val) {
      if (!val) return;
      const el = document.querySelector(sel);
      if (el) el.textContent = val;
    }

    function setIn(root, sel, val) {
      if (!val || !root) return;
      const el = root.querySelector(sel);
      if (el) el.textContent = val;
    }

    if (texts.hero) {
      setText('.hero__title', texts.hero.title);
      setText('.hero__subtitle', texts.hero.subtitle);
    }

    Object.keys(texts.sections || {}).forEach(function (key) {
      const block = texts.sections[key];
      const section = document.getElementById(key);
      if (!section || !block) return;
      setIn(section, '.eyebrow', block.eyebrow);
      setIn(section, '.section-title', block.title);
      setIn(section, '.section-lead', block.lead);
    });

    if (texts.contact) {
      applyContactData();
    }
  }

  let portfolioModal = null;

  function bootContent() {
    applySiteTexts();
    renderHeroTags();
    renderPortfolioGrid();
    portfolioModal = initPortfolioModal();
    focusPortfolioCase();
  }

  (window.siteReady || Promise.resolve()).finally(bootContent);

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

  const wavesHeroOpts = {
    lineColor: 'rgba(160, 152, 145, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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

  const wavesHero = document.getElementById('waves-hero');
  if (wavesHero && window.Waves) {
    new window.Waves(wavesHero, wavesHeroOpts);
  }

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
