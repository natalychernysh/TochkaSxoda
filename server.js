require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const CONTENT_PATH = path.join(DATA_DIR, 'content.json');
const ANALYTICS_PATH = path.join(DATA_DIR, 'analytics.json');
const ADMIN_DIR = path.join(ROOT, 'admin');
const ASSETS_DIR = path.join(ROOT, 'assets');

const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'tochka2026').trim();
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-production';

fs.mkdirSync(DATA_DIR, { recursive: true });

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getAnalytics() {
  return readJson(ANALYTICS_PATH, { sessions: {} });
}

function saveAnalytics(data) {
  writeJson(ANALYTICS_PATH, data);
}

function requireAuth(req, res, next) {
  if (req.session?.admin) return next();
  res.status(401).json({ error: 'Нужна авторизация' });
}

function countGalleryFiles(folderPath) {
  if (!fs.existsSync(folderPath)) return [];
  return fs.readdirSync(folderPath)
    .filter((name) => /^фото\d+/i.test(name))
    .sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return na - nb;
    })
    .map((name) => 'assets/' + path.basename(folderPath) + '/' + name);
}

function syncPortfolioGallery(item) {
  if (!item.folder) return item;
  const folderPath = path.join(ASSETS_DIR, item.folder);
  if (!fs.existsSync(folderPath)) return item;
  const gallery = countGalleryFiles(folderPath);
  if (gallery.length) item.gallery = gallery;
  const preview = fs.readdirSync(folderPath).find((n) => /^превью\./i.test(n));
  if (preview) item.cover = 'assets/' + item.folder + '/' + preview;
  return item;
}

function slugifyId(text) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
    у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
    э: 'e', ю: 'yu', я: 'ya'
  };
  const slug = String(text || '')
    .trim()
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] || ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
  return slug || 'project';
}

function uniqueProjectId(content, base) {
  const ids = new Set((content.portfolio || []).map((p) => p.id));
  if (!ids.has(base)) return base;
  let i = 2;
  while (ids.has(base + '-' + i)) i += 1;
  return base + '-' + i;
}

const app = express();
app.use(express.json({ limit: '2mb' }));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

app.use(express.static(ROOT));
app.use('/admin', express.static(ADMIN_DIR, { index: 'index.html' }));

/* ——— Публичный контент ——— */
app.get('/api/content', (req, res) => {
  const content = readJson(CONTENT_PATH, null);
  if (!content) return res.status(404).json({ error: 'content.json не найден' });
  if (content.portfolio) {
    content.portfolio = content.portfolio.map(syncPortfolioGallery);
  }
  res.json(content);
});

/* ——— Аналитика ——— */
app.post('/api/analytics/session', (req, res) => {
  const { sessionId, referrer, landing } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: 'sessionId обязателен' });

  const data = getAnalytics();
  if (!data.sessions[sessionId]) {
    let source = 'прямой заход';
    if (referrer) {
      try {
        source = new URL(referrer).hostname.replace(/^www\./, '') || 'прямой заход';
      } catch {
        source = referrer.slice(0, 80);
      }
    }
    data.sessions[sessionId] = {
      id: sessionId,
      startedAt: Date.now(),
      referrer: referrer || '',
      source,
      landing: landing || '/',
      sections: {},
      contactClicked: false,
      portfolioOpens: [],
      durationSec: 0,
      lastPing: Date.now()
    };
    saveAnalytics(data);
  }
  res.json({ ok: true });
});

app.post('/api/analytics/event', (req, res) => {
  const { sessionId, type, section, projectId, durationSec } = req.body || {};
  if (!sessionId || !type) return res.status(400).json({ error: 'sessionId и type обязательны' });

  const data = getAnalytics();
  const s = data.sessions[sessionId];
  if (!s) return res.status(404).json({ error: 'сессия не найдена' });

  s.lastPing = Date.now();
  if (typeof durationSec === 'number') s.durationSec = Math.max(s.durationSec, durationSec);

  if (type === 'section_view' && section) {
    s.sections[section] = (s.sections[section] || 0) + 1;
  }
  if (type === 'contact_click') s.contactClicked = true;
  if (type === 'ping' && typeof durationSec === 'number') {
    s.durationSec = Math.max(s.durationSec, durationSec);
  }
  if (type === 'portfolio_open' && projectId && !s.portfolioOpens.includes(projectId)) {
    s.portfolioOpens.push(projectId);
  }

  saveAnalytics(data);
  res.json({ ok: true });
});

/* ——— Админ: авторизация ——— */
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if ((password || '').trim() !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }
  req.session.admin = true;
  req.session.save((err) => {
    if (err) return res.status(500).json({ error: 'Не удалось сохранить сессию' });
    res.json({ ok: true });
  });
});

app.post('/api/admin/logout', requireAuth, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/admin/me', (req, res) => {
  res.json({ ok: Boolean(req.session?.admin) });
});

/* ——— Админ: статистика ——— */
app.get('/api/admin/stats', requireAuth, (req, res) => {
  const days = Math.min(90, Math.max(1, parseInt(req.query.days, 10) || 30));
  const since = Date.now() - days * 86400000;
  const data = getAnalytics();
  const sessions = Object.values(data.sessions).filter((s) => s.startedAt >= since);

  const referrers = {};
  const sections = {};
  let totalDuration = 0;
  let contactCount = 0;

  sessions.forEach((s) => {
    referrers[s.source] = (referrers[s.source] || 0) + 1;
    totalDuration += s.durationSec || 0;
    if (s.contactClicked) contactCount += 1;
    Object.keys(s.sections || {}).forEach((key) => {
      sections[key] = (sections[key] || 0) + (s.sections[key] || 0);
    });
  });

  const avgDuration = sessions.length ? Math.round(totalDuration / sessions.length) : 0;

  res.json({
    days,
    visits: sessions.length,
    avgDurationSec: avgDuration,
    contactClicks: contactCount,
    contactRate: sessions.length ? Math.round((contactCount / sessions.length) * 100) : 0,
    referrers: Object.entries(referrers)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count })),
    sections: Object.entries(sections)
      .sort((a, b) => b[1] - a[1])
      .map(([section, count]) => ({ section, count })),
    recent: sessions
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, 20)
      .map((s) => ({
        id: s.id.slice(0, 8),
        date: new Date(s.startedAt).toLocaleString('ru-RU'),
        source: s.source,
        durationSec: s.durationSec,
        sections: Object.keys(s.sections || {}),
        contact: s.contactClicked
      }))
  });
});

/* ——— Админ: контент ——— */
app.get('/api/admin/content', requireAuth, (req, res) => {
  const content = readJson(CONTENT_PATH, null);
  if (!content) return res.status(404).json({ error: 'content.json не найден' });
  res.json(content);
});

app.put('/api/admin/content', requireAuth, (req, res) => {
  const content = req.body;
  if (!content || !Array.isArray(content.portfolio)) {
    return res.status(400).json({ error: 'Некорректные данные' });
  }
  writeJson(CONTENT_PATH, content);
  res.json({ ok: true });
});

app.post('/api/admin/portfolio', requireAuth, (req, res) => {
  const { title, folder, tag, desc, alt, galleryAspect } = req.body || {};
  const folderName = (folder || title || '').trim();
  if (!folderName) return res.status(400).json({ error: 'Укажите название или папку проекта' });

  const content = readJson(CONTENT_PATH, { portfolio: [], texts: {} });
  const baseId = slugifyId(title || folderName);
  const id = uniqueProjectId(content, baseId);

  if ((content.portfolio || []).some((p) => p.folder === folderName)) {
    return res.status(400).json({ error: 'Проект с такой папкой уже есть' });
  }

  const dest = path.join(ASSETS_DIR, folderName);
  fs.mkdirSync(dest, { recursive: true });

  const item = {
    id,
    folder: folderName,
    title: (title || folderName).trim(),
    tag: (tag || '').trim(),
    desc: (desc || '').trim(),
    alt: (alt || title || folderName).trim(),
    cover: '',
    gallery: [],
    galleryAspect: galleryAspect === '4/3' ? '4/3' : undefined
  };

  syncPortfolioGallery(item);
  content.portfolio = content.portfolio || [];
  content.portfolio.push(item);
  writeJson(CONTENT_PATH, content);
  res.json({ ok: true, item });
});

app.delete('/api/admin/portfolio/:id', requireAuth, (req, res) => {
  const content = readJson(CONTENT_PATH, { portfolio: [] });
  const idx = (content.portfolio || []).findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Проект не найден' });
  content.portfolio.splice(idx, 1);
  writeJson(CONTENT_PATH, content);
  res.json({ ok: true });
});

/* ——— Админ: загрузка фото ——— */
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const folder = req.body.folder;
      if (!folder) return cb(new Error('folder обязателен'));
      const dest = path.join(ASSETS_DIR, folder);
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename(req, file, cb) {
      const type = req.body.type;
      const ext = path.extname(file.originalname).toLowerCase() || '.png';
      if (type === 'preview') return cb(null, 'Превью' + ext);
      if (type === 'gallery') {
        const folder = req.body.folder;
        const dest = path.join(ASSETS_DIR, folder);
        const existing = fs.existsSync(dest)
          ? fs.readdirSync(dest).filter((n) => /^фото\d+/i.test(n))
          : [];
        const next = existing.length + 1;
        return cb(null, 'фото' + next + ext);
      }
      cb(new Error('type: preview или gallery'));
    }
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Только изображения'));
  }
});

app.post('/api/admin/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не получен' });
  const rel = 'assets/' + req.body.folder + '/' + req.file.filename;
  const content = readJson(CONTENT_PATH, { portfolio: [] });
  const item = content.portfolio?.find((p) => p.folder === req.body.folder || p.id === req.body.projectId);
  if (item) {
    if (req.body.type === 'preview') item.cover = rel;
    else if (req.body.type === 'gallery') {
      item.gallery = countGalleryFiles(path.join(ASSETS_DIR, req.body.folder));
    }
    writeJson(CONTENT_PATH, content);
  }
  res.json({ ok: true, path: rel });
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Ошибка сервера' });
});

app.listen(PORT, () => {
  console.log('Точка схода → http://localhost:' + PORT);
  console.log('Админка → http://localhost:' + PORT + '/admin/');
  if (ADMIN_PASSWORD === 'tochka2026') {
    console.log('⚠ Пароль по умолчанию: tochka2026 — задайте ADMIN_PASSWORD в .env');
  } else {
    console.log('✓ Пароль админки загружен из .env');
  }
});
