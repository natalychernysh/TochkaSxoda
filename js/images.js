/**
 * Портфолио: в каждой папке проекта
 *   Превью.png  — карточка в сетке (4:3)
 *   фото1, фото2 … — карусель в модалке (количество своё)
 *
 * galleryAspect: '4/3' — слайды 4:3 в модалке (Тишь да пар, Сайты/боты)
 */
function coverPath(folder) {
  return 'assets/' + folder + '/Превью.png';
}

function photoSeries(folder, count, ext) {
  ext = ext || 'png';
  var list = [];
  for (var i = 1; i <= count; i++) {
    list.push('assets/' + folder + '/фото' + i + '.' + ext);
  }
  return list;
}

window.SITE_IMAGES = {
  heroCollage: {
    src: 'assets/hero-tags/tags.png',
    alt: 'Кейсы агентства — Bellissima, Тишь да пар, marmori, Daizy Mitchell, сайты и боты',
    link: '#portfolio',
    height: 'min(88vh, 52rem)',
    lift: '14rem'
  },

  heroTags: [],

  portfolio: [
    {
      id: 'tish',
      cover: coverPath('Тишь да пар'),
      gallery: photoSeries('Тишь да пар', 9),
      galleryAspect: '4/3',
      alt: 'Тишь да пар',
      tag: 'Бренд · digital',
      title: 'Тишь да пар',
      desc: 'Загородный отдых: нейминг, визуал и упаковка VK'
    },
    {
      id: 'marmori',
      cover: coverPath('marmori'),
      gallery: photoSeries('marmori', 9),
      alt: 'marmori',
      tag: 'Упаковка · MP',
      title: 'marmori',
      desc: 'Подарочные наборы и визуал для маркетплейса'
    },
    {
      id: 'daizy',
      cover: coverPath('Daizy Mitchell'),
      gallery: photoSeries('Daizy Mitchell', 6),
      alt: 'Daizy Mitchell',
      tag: 'Брендинг · контент',
      title: 'Daizy Mitchell',
      desc: 'Брендбук, lookbook и контент-система'
    },
    {
      id: 'bellissima',
      cover: coverPath('Bellissima'),
      gallery: photoSeries('Bellissima', 12),
      alt: 'Bellissima',
      tag: 'Контент',
      title: 'Bellissima',
      desc: 'Визуал и подача премиального бренда'
    },
    {
      id: 'mp',
      cover: coverPath('Нижнее белье и колготки'),
      gallery: photoSeries('Нижнее белье и колготки', 13),
      alt: 'Карточки маркетплейсов',
      tag: 'Маркетплейсы',
      title: 'Нижнее белье и колготки',
      desc: 'Rich-контент для Ozon и Wildberries'
    },
    {
      id: 'digital',
      cover: coverPath('Сайты, лендинги, боты'),
      gallery: photoSeries('Сайты, лендинги, боты', 3),
      galleryAspect: '4/3',
      alt: 'Сайты и боты',
      tag: 'Сайты · автоматизация',
      title: 'Сайты, лендинги, боты',
      desc: 'Цифровые решения и автоматизация под задачу бизнеса'
    },
    {
      id: 'limonades',
      cover: coverPath('Итальянские лимонады'),
      gallery: [
        'assets/Итальянские лимонады/фото1.webp',
        'assets/Итальянские лимонады/фото2.webp',
        'assets/Итальянские лимонады/фото3.webp',
        'assets/Итальянские лимонады/фото4.png'
      ],
      alt: 'Итальянские лимонады',
      tag: 'Каталог · B2B',
      title: 'Итальянские лимонады',
      desc: 'Каталоги, ассортимент и материалы для дистрибьюторов'
    }
  ]
};
