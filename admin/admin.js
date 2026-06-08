(function () {
  var content = null;
  var loginScreen, app, loginForm, loginError;

  var sectionLabels = {
    hero: 'Hero',
    audience: 'Для кого',
    directions: 'Услуги',
    portfolio: 'Портфолио',
    process: 'Процесс',
    about: 'О нас',
    contact: 'Контакты'
  };

  var DEFAULT_PORT = 3001;

  function adminEntryUrl() {
    if (location.protocol !== 'file:') return location.origin + '/admin/';
    return 'http://localhost:' + DEFAULT_PORT + '/admin/';
  }

  function api(path, options) {
    options = options || {};
    return fetch(path, Object.assign({ credentials: 'same-origin' }, options))
      .then(function (res) {
        return res.text().then(function (text) {
          var data = {};
          if (text) {
            try {
              data = JSON.parse(text);
            } catch (e) {
              if (!res.ok) throw new Error('Сервер недоступен. Запустите start.bat и откройте ' + adminEntryUrl());
              throw new Error('Некорректный ответ сервера');
            }
          }
          if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
          return data;
        });
      })
      .catch(function (err) {
        if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
          throw new Error('Нет связи с сервером. Запустите start.bat в папке проекта.');
        }
        throw err;
      });
  }

  function formatDuration(sec) {
    if (!sec) return '0 сек';
    if (sec < 60) return sec + ' сек';
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ' мин' + (s ? ' ' + s + ' сек' : '');
  }

  function showLogin() {
    loginScreen.hidden = false;
    loginScreen.style.display = '';
    app.hidden = true;
    app.style.display = 'none';
    setAppLoading(false);
  }

  function showApp() {
    loginScreen.hidden = true;
    loginScreen.style.display = 'none';
    app.hidden = false;
    app.style.display = '';
  }

  function setAppLoading(on) {
    var el = document.getElementById('app-loading');
    if (!el) return;
    el.hidden = !on;
  }

  function setLoginError(text) {
    if (loginError) loginError.textContent = text || '';
  }

  function setLoginStatus(text) {
    var el = document.getElementById('login-status');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'status' + (text ? ' ok' : '');
  }

  function setStatus(el, text, ok) {
    if (!el) return;
    el.hidden = !text;
    el.textContent = text || '';
    el.className = 'status' + (text ? (ok ? ' ok' : ' err') : '');
  }

  function renderTable(container, headers, rows) {
    if (!rows.length) {
      container.innerHTML = '<p class="muted">Пока нет данных</p>';
      return;
    }
    var html = '<table><thead><tr>';
    headers.forEach(function (h) { html += '<th>' + h + '</th>'; });
    html += '</tr></thead><tbody>';
    rows.forEach(function (row) {
      html += '<tr>';
      row.forEach(function (cell) { html += '<td>' + cell + '</td>'; });
      html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function loadStats() {
    var days = document.getElementById('stats-days').value;
    api('/api/admin/stats?days=' + days).then(function (data) {
      document.getElementById('stat-visits').textContent = data.visits;
      document.getElementById('stat-duration').textContent = formatDuration(data.avgDurationSec);
      document.getElementById('stat-contacts').textContent = data.contactClicks;
      document.getElementById('stat-rate').textContent = data.contactRate + '%';

      renderTable(
        document.getElementById('stat-referrers'),
        ['Источник', 'Визиты'],
        data.referrers.map(function (r) { return [r.source, r.count]; })
      );

      renderTable(
        document.getElementById('stat-sections'),
        ['Раздел', 'Просмотры'],
        data.sections.map(function (s) {
          return [sectionLabels[s.section] || s.section, s.count];
        })
      );

      renderTable(
        document.getElementById('stat-recent'),
        ['Дата', 'Источник', 'Время', 'Разделы', 'Контакты'],
        data.recent.map(function (s) {
          return [
            s.date,
            s.source,
            formatDuration(s.durationSec),
            (s.sections || []).map(function (id) { return sectionLabels[id] || id; }).join(', ') || '—',
            s.contact ? 'да' : 'нет'
          ];
        })
      );
    }).catch(function (err) {
      alert(err.message);
    });
  }

  function field(label, id, value, multiline, placeholder) {
    var wrap = document.createElement('label');
    wrap.className = 'field';
    var span = document.createElement('span');
    span.textContent = label;
    var input = multiline ? document.createElement('textarea') : document.createElement('input');
    input.id = id;
    input.value = value || '';
    if (placeholder) input.placeholder = placeholder;
    wrap.appendChild(span);
    wrap.appendChild(input);
    return wrap;
  }

  function renderTextsEditor() {
    var root = document.getElementById('texts-editor');
    root.innerHTML = '';
    if (!content || !content.texts) return;

    var heroBlock = document.createElement('article');
    heroBlock.className = 'editor-block';
    heroBlock.innerHTML = '<h3>Главный экран</h3>';
    heroBlock.appendChild(field('Заголовок', 'text-hero-title', content.texts.hero.title, false));
    heroBlock.appendChild(field('Подзаголовок', 'text-hero-subtitle', content.texts.hero.subtitle, true));
    root.appendChild(heroBlock);

    Object.keys(content.texts.sections || {}).forEach(function (key) {
      var block = content.texts.sections[key];
      var sectionBlock = document.createElement('article');
      sectionBlock.className = 'editor-block';
      sectionBlock.innerHTML = '<h3>' + (sectionLabels[key] || key) + '</h3>';
      sectionBlock.appendChild(field('Eyebrow', 'text-' + key + '-eyebrow', block.eyebrow, false));
      sectionBlock.appendChild(field('Заголовок', 'text-' + key + '-title', block.title, false));
      sectionBlock.appendChild(field('Описание', 'text-' + key + '-lead', block.lead, true));
      root.appendChild(sectionBlock);
    });

  }

  function collectTexts() {
    content.texts.hero.title = document.getElementById('text-hero-title').value.trim();
    content.texts.hero.subtitle = document.getElementById('text-hero-subtitle').value.trim();

    Object.keys(content.texts.sections).forEach(function (key) {
      content.texts.sections[key].eyebrow = document.getElementById('text-' + key + '-eyebrow').value.trim();
      content.texts.sections[key].title = document.getElementById('text-' + key + '-title').value.trim();
      content.texts.sections[key].lead = document.getElementById('text-' + key + '-lead').value.trim();
    });
  }

  function uploadProjectFile(projectId, folder, type, file) {
    var form = new FormData();
    form.append('file', file);
    form.append('folder', folder);
    form.append('projectId', projectId);
    form.append('type', type);
    return fetch('/api/admin/upload', {
      method: 'POST',
      credentials: 'same-origin',
      body: form
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');
        return data;
      });
    });
  }

  function migrateContactShape(c) {
    if (!Array.isArray(c.actions) || !c.actions.length) {
      c.actions = [
        {
          label: c.telegramLabel || 'Telegram →',
          href: c.telegramUrl || 'https://t.me/',
          primary: true
        },
        {
          label: c.callLabel || 'Созвон',
          href: c.callUrl || '#contact',
          primary: false
        }
      ];
    }
    if (!Array.isArray(c.links)) c.links = [];
  }

  function ensureContactDefaults() {
    if (!content.texts) content.texts = {};
    if (!content.texts.contact) content.texts.contact = {};
    migrateContactShape(content.texts.contact);
  }

  function renderContactActionsEditor() {
    ensureContactDefaults();
    var wrap = document.getElementById('contact-actions-editor');
    if (!wrap) return;
    wrap.innerHTML = '';
    content.texts.contact.actions.forEach(function (action, index) {
      var row = document.createElement('div');
      row.className = 'editor-block editor-block--nested';
      row.appendChild(field('Подпись на кнопке', 'contact-action-label-' + index, action.label, false, 'Telegram →'));
      row.appendChild(field('Куда ведёт (URL)', 'contact-action-href-' + index, action.href, false, 'https://t.me/username'));
      var primaryWrap = document.createElement('label');
      primaryWrap.className = 'field field--inline';
      var primaryInput = document.createElement('input');
      primaryInput.type = 'checkbox';
      primaryInput.id = 'contact-action-primary-' + index;
      primaryInput.checked = Boolean(action.primary);
      primaryWrap.appendChild(primaryInput);
      primaryWrap.appendChild(document.createElement('span')).textContent = 'Главная кнопка (оранжевая)';
      row.appendChild(primaryWrap);
      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn btn--danger';
      removeBtn.textContent = 'Удалить кнопку';
      removeBtn.addEventListener('click', function () {
        content.texts.contact.actions.splice(index, 1);
        renderContactActionsEditor();
      });
      row.appendChild(removeBtn);
      wrap.appendChild(row);
    });
  }

  function renderContactsEditor() {
    var root = document.getElementById('contacts-editor');
    root.innerHTML = '';
    ensureContactDefaults();
    var c = content.texts.contact;

    var block = document.createElement('article');
    block.className = 'editor-block';
    block.innerHTML = '<h3>Текст блока</h3>';
    block.appendChild(field('Заголовок', 'contact-title', c.title, false));
    block.appendChild(field('Описание', 'contact-text', c.text, true));
    root.appendChild(block);

    var actionsBlock = document.createElement('article');
    actionsBlock.className = 'editor-block';
    actionsBlock.innerHTML = '<h3>Кнопки</h3><p class="hint muted">У каждой кнопки — подпись и ссылка, куда попадёт клиент.</p><div id="contact-actions-editor"></div>';
    root.appendChild(actionsBlock);
    renderContactActionsEditor();
    var addActionBtn = document.createElement('button');
    addActionBtn.type = 'button';
    addActionBtn.className = 'btn btn--ghost';
    addActionBtn.textContent = '+ Добавить кнопку';
    addActionBtn.addEventListener('click', function () {
      c.actions.push({ label: '', href: '', primary: false });
      renderContactActionsEditor();
    });
    actionsBlock.appendChild(addActionBtn);

    var linksBlock = document.createElement('article');
    linksBlock.className = 'editor-block';
    linksBlock.innerHTML = '<h3>Ссылки в строке ниже</h3><p class="hint muted">Телефон, WhatsApp, сайт — тоже с явным URL.</p><div id="contact-links-editor"></div>';
    root.appendChild(linksBlock);
    renderContactLinksEditor();

    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn--ghost';
    addBtn.textContent = '+ Добавить ссылку';
    addBtn.addEventListener('click', function () {
      c.links.push({ href: '', label: '', external: true });
      renderContactLinksEditor();
    });
    linksBlock.appendChild(addBtn);
  }

  function renderContactLinksEditor() {
    ensureContactDefaults();
    var wrap = document.getElementById('contact-links-editor');
    if (!wrap) return;
    wrap.innerHTML = '';
    content.texts.contact.links.forEach(function (link, index) {
      var row = document.createElement('div');
      row.className = 'editor-block editor-block--nested';
      row.appendChild(field('Подпись', 'contact-link-label-' + index, link.label, false, '@tochkashoda'));
      row.appendChild(field('Куда ведёт (URL)', 'contact-link-href-' + index, link.href, false, 'https://t.me/username или tel:+79001234567'));
      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn btn--danger';
      removeBtn.textContent = 'Удалить ссылку';
      removeBtn.addEventListener('click', function () {
        content.texts.contact.links.splice(index, 1);
        renderContactLinksEditor();
      });
      row.appendChild(removeBtn);
      wrap.appendChild(row);
    });
  }

  function collectContacts() {
    ensureContactDefaults();
    var c = content.texts.contact;
    c.title = document.getElementById('contact-title').value.trim();
    c.text = document.getElementById('contact-text').value.trim();
    c.actions = (c.actions || []).map(function (_, index) {
      return {
        label: document.getElementById('contact-action-label-' + index).value.trim(),
        href: document.getElementById('contact-action-href-' + index).value.trim(),
        primary: document.getElementById('contact-action-primary-' + index).checked
      };
    }).filter(function (action) { return action.href && action.label; });
    if (c.actions.length && !c.actions.some(function (a) { return a.primary; })) {
      c.actions[0].primary = true;
    }
    c.links = (c.links || []).map(function (_, index) {
      return {
        href: document.getElementById('contact-link-href-' + index).value.trim(),
        label: document.getElementById('contact-link-label-' + index).value.trim(),
        external: true
      };
    }).filter(function (link) { return link.href && link.label; });
    var primary = c.actions.find(function (a) { return a.primary; });
    var secondary = c.actions.find(function (a) { return !a.primary; });
    if (primary) {
      c.telegramLabel = primary.label;
      c.telegramUrl = primary.href;
    }
    if (secondary) {
      c.callLabel = secondary.label;
      c.callUrl = secondary.href;
    }
  }

  function renderNewProjectForm() {
    var root = document.getElementById('new-project-fields');
    if (!root) return;
    root.innerHTML = '';
    root.appendChild(field('Название проекта', 'new-project-title', '', false));
    root.appendChild(field('Папка в assets (если пусто — как название)', 'new-project-folder', '', false));
    root.appendChild(field('Тег', 'new-project-tag', '', false));
    root.appendChild(field('Описание', 'new-project-desc', '', true));
    var aspectWrap = document.createElement('label');
    aspectWrap.className = 'field';
    aspectWrap.innerHTML = '<span>Галерея 4:3 в модалке</span><input type="checkbox" id="new-project-aspect">';
    root.appendChild(aspectWrap);
  }

  function renderPortfolioEditor() {
    var root = document.getElementById('portfolio-editor');
    root.innerHTML = '';
    if (!content || !content.portfolio) return;

    content.portfolio.forEach(function (item, index) {
      var block = document.createElement('article');
      block.className = 'editor-block';

      var head = document.createElement('div');
      head.className = 'panel-head';
      head.style.marginBottom = '0.75rem';
      head.innerHTML = '<h3 style="margin:0">' + (item.title || item.id) + '</h3>';
      var deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn--danger';
      deleteBtn.textContent = 'Удалить';
      deleteBtn.addEventListener('click', function () {
        if (!confirm('Удалить проект «' + (item.title || item.id) + '» из портфолио?')) return;
        api('/api/admin/portfolio/' + item.id, { method: 'DELETE' })
          .then(loadContent)
          .catch(function (err) { alert(err.message); });
      });
      head.appendChild(deleteBtn);
      block.appendChild(head);

      if (item.cover) {
        var img = document.createElement('img');
        img.className = 'preview-thumb';
        img.src = '/' + item.cover.replace(/^\/+/, '');
        img.alt = item.title || '';
        block.appendChild(img);
      }

      block.appendChild(field('Тег', 'pf-' + index + '-tag', item.tag, false));
      block.appendChild(field('Заголовок', 'pf-' + index + '-title', item.title, false));
      block.appendChild(field('Описание', 'pf-' + index + '-desc', item.desc, true));
      block.appendChild(field('Alt', 'pf-' + index + '-alt', item.alt, false));

      var aspectWrap = document.createElement('label');
      aspectWrap.className = 'field';
      var aspectInput = document.createElement('input');
      aspectInput.type = 'checkbox';
      aspectInput.id = 'pf-' + index + '-aspect';
      aspectInput.checked = item.galleryAspect === '4/3';
      aspectWrap.appendChild(document.createElement('span')).textContent = 'Галерея 4:3 в модалке';
      aspectWrap.appendChild(aspectInput);
      block.appendChild(aspectWrap);

      var meta = document.createElement('p');
      meta.className = 'muted';
      meta.textContent = 'Папка: ' + (item.folder || '—') + ' · фото: ' + (item.gallery ? item.gallery.length : 0);
      block.appendChild(meta);

      var actions = document.createElement('div');
      actions.className = 'editor-actions';
      var previewInput = document.createElement('input');
      previewInput.type = 'file';
      previewInput.accept = 'image/*';
      previewInput.hidden = true;
      previewInput.addEventListener('change', function () {
        if (!previewInput.files[0]) return;
        uploadProjectFile(item.id, item.folder, 'preview', previewInput.files[0])
          .then(loadContent).catch(function (err) { alert(err.message); });
      });
      var galleryInput = document.createElement('input');
      galleryInput.type = 'file';
      galleryInput.accept = 'image/*';
      galleryInput.hidden = true;
      galleryInput.addEventListener('change', function () {
        if (!galleryInput.files[0]) return;
        uploadProjectFile(item.id, item.folder, 'gallery', galleryInput.files[0])
          .then(loadContent).catch(function (err) { alert(err.message); });
      });
      var previewBtn = document.createElement('button');
      previewBtn.type = 'button';
      previewBtn.className = 'btn btn--ghost';
      previewBtn.textContent = 'Загрузить превью';
      previewBtn.addEventListener('click', function () { previewInput.click(); });
      var galleryBtn = document.createElement('button');
      galleryBtn.type = 'button';
      galleryBtn.className = 'btn btn--ghost';
      galleryBtn.textContent = 'Добавить фото в галерею';
      galleryBtn.addEventListener('click', function () { galleryInput.click(); });
      actions.appendChild(previewBtn);
      actions.appendChild(galleryBtn);
      block.appendChild(actions);

      root.appendChild(block);
    });
  }

  function collectPortfolio() {
    content.portfolio.forEach(function (item, index) {
      item.tag = document.getElementById('pf-' + index + '-tag').value.trim();
      item.title = document.getElementById('pf-' + index + '-title').value.trim();
      item.desc = document.getElementById('pf-' + index + '-desc').value.trim();
      item.alt = document.getElementById('pf-' + index + '-alt').value.trim();
      var aspect = document.getElementById('pf-' + index + '-aspect');
      if (aspect && aspect.checked) item.galleryAspect = '4/3';
      else delete item.galleryAspect;
    });
  }

  function fillUploadProjects() {
    var select = document.getElementById('upload-project');
    if (!select) return;
    (content.portfolio || []).forEach(function (item) {
      var opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.title + ' (' + item.folder + ')';
      opt.dataset.folder = item.folder;
      select.appendChild(opt);
    });
  }

  function loadContent() {
    return api('/api/admin/content').then(function (data) {
      content = data;
      renderTextsEditor();
      renderContactsEditor();
      renderNewProjectForm();
      renderPortfolioEditor();
      fillUploadProjects();
    });
  }

  function doLogin() {
    var passwordEl = document.getElementById('login-password');
    var loginBtn = document.getElementById('login-btn');
    if (!passwordEl || !loginBtn) return;

    var password = passwordEl.value.trim();
    setLoginError('');
    setLoginStatus('');

    if (!password) {
      setLoginError('Введите пароль');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Вхожу…';
    setLoginStatus('Проверяю пароль…');

    api('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password })
    }).then(function () {
      showApp();
      setAppLoading(true);
      setLoginStatus('');
      return loadContent().then(loadStats);
    }).catch(function (err) {
      showLogin();
      setLoginError(err.message || 'Не удалось войти');
      setLoginStatus('');
    }).finally(function () {
      setAppLoading(false);
      loginBtn.disabled = false;
      loginBtn.textContent = 'Войти';
    });
  }

  function initAdmin() {
    loginScreen = document.getElementById('login-screen');
    app = document.getElementById('app');
    loginForm = document.getElementById('login-form');
    loginError = document.getElementById('login-error');

    if (!loginForm || !app || !loginScreen) {
      document.body.innerHTML = '<p style="padding:2rem;font-family:sans-serif">Ошибка загрузки админки. Обновите страницу (Ctrl+F5).</p>';
      return;
    }

    if (location.protocol === 'file:') {
      setLoginError('Не открывай файл с диска. Дважды кликни start.bat в папке проекта.');
    } else {
      var hint = document.getElementById('login-hint');
      if (hint) {
        hint.innerHTML = 'Вы здесь: <strong>' + location.origin + '/admin/</strong> · пароль из <strong>.env</strong> (ADMIN_PASSWORD)';
      }
    }

    document.getElementById('login-btn').addEventListener('click', doLogin);
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      doLogin();
    });
    document.getElementById('login-password').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        doLogin();
      }
    });

    document.getElementById('logout-btn').addEventListener('click', function () {
      api('/api/admin/logout', { method: 'POST' }).finally(showLogin);
    });

    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var name = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab').forEach(function (t) {
          t.classList.toggle('is-active', t === tab);
        });
        document.querySelectorAll('.panel').forEach(function (panel) {
          panel.classList.toggle('is-active', panel.id === 'panel-' + name);
        });
        if (name === 'stats') loadStats();
      });
    });

    document.getElementById('stats-days').addEventListener('change', loadStats);

    document.getElementById('save-texts-btn').addEventListener('click', function () {
      var status = document.getElementById('texts-status');
      collectTexts();
      api('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      }).then(function () {
        setStatus(status, 'Тексты сохранены', true);
      }).catch(function (err) {
        setStatus(status, err.message, false);
      });
    });

    document.getElementById('save-contacts-btn').addEventListener('click', function () {
      var status = document.getElementById('contacts-status');
      collectContacts();
      api('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      }).then(function () {
        setStatus(status, 'Контакты сохранены', true);
      }).catch(function (err) {
        setStatus(status, err.message, false);
      });
    });

    document.getElementById('add-project-btn').addEventListener('click', function () {
      var status = document.getElementById('portfolio-status');
      var title = document.getElementById('new-project-title').value.trim();
      var folder = document.getElementById('new-project-folder').value.trim() || title;
      var tag = document.getElementById('new-project-tag').value.trim();
      var desc = document.getElementById('new-project-desc').value.trim();
      var aspect = document.getElementById('new-project-aspect').checked ? '4/3' : undefined;
      if (!title) {
        setStatus(status, 'Укажите название проекта', false);
        return;
      }
      api('/api/admin/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title, folder: folder, tag: tag, desc: desc, alt: title, galleryAspect: aspect })
      }).then(function () {
        setStatus(status, 'Проект создан — загрузите превью и фото', true);
        return loadContent();
      }).catch(function (err) {
        setStatus(status, err.message, false);
      });
    });

    document.getElementById('save-portfolio-btn').addEventListener('click', function () {
      var status = document.getElementById('portfolio-status');
      collectPortfolio();
      api('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      }).then(function () {
        setStatus(status, 'Кейсы сохранены', true);
      }).catch(function (err) {
        setStatus(status, err.message, false);
      });
    });

    document.getElementById('upload-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('upload-status');
      var projectSelect = document.getElementById('upload-project');
      var selected = projectSelect.options[projectSelect.selectedIndex];
      var folder = selected.dataset.folder;
      var projectId = projectSelect.value;
      var type = document.getElementById('upload-type').value;
      var fileInput = document.getElementById('upload-file');
      var file = fileInput.files[0];
      if (!file) return;

      var form = new FormData();
      form.append('file', file);
      form.append('folder', folder);
      form.append('projectId', projectId);
      form.append('type', type);

      fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'same-origin',
        body: form
      }).then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');
          return data;
        });
      }).then(function (data) {
        setStatus(status, 'Загружено: ' + data.path, true);
        fileInput.value = '';
        return loadContent();
      }).catch(function (err) {
        setStatus(status, err.message, false);
      });
    });

    api('/api/admin/me').then(function (data) {
      if (data.ok) {
        showApp();
        setAppLoading(true);
        loadContent().then(loadStats).finally(function () {
          setAppLoading(false);
        });
      } else {
        showLogin();
      }
    }).catch(showLogin);
  }

  document.addEventListener('DOMContentLoaded', initAdmin);
})();
