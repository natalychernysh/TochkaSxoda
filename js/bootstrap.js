window.siteReady = fetch('/api/content')
  .then(function (res) {
    if (!res.ok) return null;
    return res.json();
  })
  .then(function (data) {
    if (data) window.SITE_IMAGES = data;
    return data;
  })
  .catch(function () {
    return null;
  });
