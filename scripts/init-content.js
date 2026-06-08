const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const imagesPath = path.join(ROOT, 'js', 'images.js');
const outPath = path.join(ROOT, 'data', 'content.json');

const code = fs.readFileSync(imagesPath, 'utf8');
const fn = new Function('window', code + '; return window.SITE_IMAGES;');
const data = fn({});

const folders = {
  tish: 'Тишь да пар',
  marmori: 'marmori',
  daizy: 'Daizy Mitchell',
  bellissima: 'Bellissima',
  mp: 'Нижнее белье и колготки',
  digital: 'Сайты, лендинги, боты',
  limonades: 'Итальянские лимонады',
  jewelry: 'Бижутерия',
  branding: 'Брендинг',
  concepts: 'Концепты для бренда одежды'
};

data.portfolio.forEach((p) => {
  p.folder = folders[p.id];
});

data.texts = {
  hero: {
    title: 'Упаковываем бизнес под ключ — от стратегии до заявок',
    subtitle:
      'Агентство полного цикла — стратегия, бренд, маркетинг, маркетплейсы, сайты и автоматизация — в одних руках. Вы управляете бизнесом, мы собираем систему вокруг него.'
  },
  sections: {
    audience: {
      eyebrow: 'Для кого',
      title: 'Кому нужна «Точка схода»',
      lead: 'Там, где уже мало «просто красивой картинки» — нужна система: продукт, упаковка, каналы и следующие шаги.'
    },
    directions: {
      eyebrow: 'Услуги',
      title: 'Три входа в систему',
      lead: 'Одно направление или полная упаковка — выбираете вы, собираем мы.'
    },
    portfolio: {
      eyebrow: 'Портфолио',
      title: 'Кейсы, которые говорят сами',
      lead: 'Брендинг, маркетплейсы, digital и упаковка — реальные проекты, не moodboard ради moodboard.'
    },
    process: {
      eyebrow: 'Процесс',
      title: 'Как мы работаем',
      lead: 'Пять шагов от хаоса к системе — с понятными точками контроля на каждом этапе.'
    },
    about: {
      eyebrow: 'О нас',
      title: 'Команда, которая собирает маркетинг в систему',
      lead:
        '«Точка схода» — агентство полного цикла. Стратегия, бренд, digital, маркетплейсы и автоматизация — одна команда, один процесс, одна ответственность за результат.'
    }
  },
  contact: {
    title: 'Где буксует бизнес — покажем, с чего начать',
    text: 'Запуск, MП, сайт, упаковка или автоматизация — соберём маршрут без суеты.',
    telegramUrl: 'https://t.me/tochkashoda',
    telegramLabel: 'Telegram →',
    callUrl: '#contact',
    callLabel: 'Созвон',
    actions: [
      { label: 'Telegram →', href: 'https://t.me/tochkashoda', primary: true },
      { label: 'Созвон', href: '#contact', primary: false }
    ],
    links: [
      { href: 'https://t.me/tochkashoda', label: '@tochkashoda', external: true },
      { href: 'https://wa.me/79000101021', label: 'WhatsApp', external: true },
      { href: 'tel:+79000101021', label: '+7 (900) 010-10-21', external: false },
      { href: 'https://tochka-shoda.ru', label: 'tochka-shoda.ru', external: true }
    ]
  }
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
console.log('content.json создан:', outPath);
