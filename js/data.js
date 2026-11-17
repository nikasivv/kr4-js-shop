/*
  data.js — данные интернет-магазина.
  Здесь только массив товаров и названия категорий, без работы с DOM.
  Файл подключается первым, остальные скрипты используют products и categoryNames.
*/

const categoryNames = {
  bouquets: 'Букеты',
  compositions: 'Композиции',
  field: 'Полевые цветы',
  plants: 'Комнатные растения'
};

/*
  Структура товара:
  id          — уникальный номер (число);
  title       — название;
  category    — ключ категории из categoryNames;
  price       — цена в рублях (число);
  oldPrice    — цена до скидки или null;
  isAvailable — есть ли товар в наличии;
  badge       — бейдж карточки: 'hit', 'new', 'sale' или null;
  image       — начало имени файла картинки (images/<image>-400.webp и т. д.);
  description — короткое описание для карточки;
  page        — страница товара или null, если отдельной страницы нет.
*/
const products = [
  {
    id: 1,
    title: 'Букет «Нежность»',
    category: 'bouquets',
    price: 3490,
    oldPrice: null,
    isAvailable: true,
    badge: 'hit',
    image: 'roses',
    description: '15 розовых роз в крафтовой упаковке с атласной лентой.',
    page: 'product.html'
  },
  {
    id: 2,
    title: 'Букет «Весна»',
    category: 'bouquets',
    price: 2490,
    oldPrice: null,
    isAvailable: true,
    badge: 'new',
    image: 'tulips',
    description: '25 разноцветных тюльпанов — яркий подарок к любому празднику.',
    page: 'product-tulips.html'
  },
  {
    id: 3,
    title: 'Пионы в шляпной коробке',
    category: 'compositions',
    price: 3990,
    oldPrice: 4990,
    isAvailable: true,
    badge: 'sale',
    image: 'peony',
    description: 'Пышные пионы и эвкалипт в круглой коробке, стоят без воды.',
    page: 'product-peony.html'
  },
  {
    id: 4,
    title: 'Ромашки «Лето»',
    category: 'field',
    price: 1490,
    oldPrice: null,
    isAvailable: true,
    badge: null,
    image: 'daisies',
    description: 'Лёгкий букет полевых ромашек с зеленью.',
    page: 'product-daisies.html'
  },
  {
    id: 5,
    title: 'Орхидея в кашпо',
    category: 'plants',
    price: 2990,
    oldPrice: null,
    isAvailable: true,
    badge: 'new',
    image: 'orchid',
    description: 'Цветущий фаленопсис в керамическом кашпо, цветёт до 3 месяцев.',
    page: 'product-orchid.html'
  },
  {
    id: 6,
    title: 'Мини-сад из суккулентов',
    category: 'plants',
    price: 1790,
    oldPrice: null,
    isAvailable: true,
    badge: null,
    image: 'succulents',
    description: 'Три суккулента в деревянном ящике, почти не требуют ухода.',
    page: 'product-succulents.html'
  },
  {
    id: 7,
    title: 'Букет «Страсть»',
    category: 'bouquets',
    price: 4290,
    oldPrice: null,
    isAvailable: true,
    badge: null,
    image: 'roses-red',
    description: '15 красных роз в крафтовой упаковке — классика для признания.',
    page: null
  },
  {
    id: 8,
    title: 'Пионы «Белое облако»',
    category: 'compositions',
    price: 4490,
    oldPrice: null,
    isAvailable: false,
    badge: null,
    image: 'peony-white',
    description: 'Белые пионы в шляпной коробке. Сезонный товар — ожидаем поставку.',
    page: null
  },
  {
    id: 9,
    title: 'Орхидея «Розовая»',
    category: 'plants',
    price: 3290,
    oldPrice: 3690,
    isAvailable: true,
    badge: 'sale',
    image: 'orchid-pink',
    description: 'Розовый фаленопсис в сером кашпо, к нему — памятка по уходу.',
    page: null
  },
  {
    id: 10,
    title: 'Букет «Солнечный»',
    category: 'field',
    price: 1890,
    oldPrice: null,
    isAvailable: true,
    badge: 'new',
    image: 'daisies-sun',
    description: 'Жёлтые хризантемы-ромашки с зеленью — поднимают настроение.',
    page: null
  }
];
