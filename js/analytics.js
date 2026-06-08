(function () {
  var API = '/api/analytics';
  var sessionId = sessionStorage.getItem('ts_session');
  if (!sessionId) {
    sessionId = 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    sessionStorage.setItem('ts_session', sessionId);
  }

  var startedAt = Date.now();
  var seenSections = {};

  function post(path, body) {
    try {
      fetch(API + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  post('/session', {
    sessionId: sessionId,
    referrer: document.referrer || '',
    landing: location.pathname + location.hash
  });

  function trackEvent(type, extra) {
    post('/event', Object.assign({ sessionId: sessionId, type: type }, extra || {}));
  }

  function durationSec() {
    return Math.round((Date.now() - startedAt) / 1000);
  }

  var sectionIds = ['hero', 'audience', 'directions', 'portfolio', 'process', 'about', 'contact'];

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.45) return;
        var id = entry.target.id;
        if (!id || seenSections[id]) return;
        seenSections[id] = true;
        trackEvent('section_view', { section: id, durationSec: durationSec() });
      });
    }, { threshold: [0.45] });

    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href="#contact"], .contact a, .header__cta, [data-track-contact]');
    if (!link) return;
    trackEvent('contact_click', { durationSec: durationSec() });
  });

  document.addEventListener('click', function (e) {
    var card = e.target.closest('.portfolio-card--open');
    if (!card) return;
    trackEvent('portfolio_open', {
      projectId: card.getAttribute('data-case'),
      durationSec: durationSec()
    });
  });

  setInterval(function () {
    trackEvent('ping', { durationSec: durationSec() });
  }, 30000);

  window.addEventListener('pagehide', function () {
    trackEvent('ping', { durationSec: durationSec() });
  });
})();
