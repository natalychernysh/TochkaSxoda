(function () {
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

  const wavesEl = document.getElementById('waves-hero');
  if (wavesEl && window.Waves) new window.Waves(wavesEl, wavesOpts);

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

  /* Header scroll */
  window.addEventListener('scroll', function () {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
    if (progressBar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = h > 0 ? (window.scrollY / h) * 100 + '%' : '0%';
    }
  }, { passive: true });

  /* Drawer */
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

  /* Direction tabs */
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
    }
  }

  window.addEventListener('hashchange', syncTabFromHash);
  syncTabFromHash();

  /* Scroll spy */
  const sections = document.querySelectorAll('main section[id]');
  const spyMap = new Map();
  navLinks.forEach(function (link) {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) spyMap.set(id, link);
  });

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

  /* Reveal */
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
