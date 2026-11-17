/*
  catalog.js — каталог на странице catalog.html:
  состояние каталога, поиск, фильтры, сортировка и вывод карточек через createElement.
  Схема: данные → функции обработки → состояние → рендер → события → новый рендер.
*/

const productsContainer = document.querySelector('[data-products-container]');
const searchInput = document.querySelector('#catalog-search');
const sortSelect = document.querySelector('#sort-select');
const filtersPanel = document.querySelector('.catalog-filters');
const filtersForm = document.querySelector('#catalog-filters-form');
const filtersToggle = document.querySelector('.catalog-filters__toggle');
const filtersBadge = document.querySelector('#filters-active-count');
const categoryFilter = document.querySelector('#category-filter');
const priceFromInput = document.querySelector('#price-from');
const priceToInput = document.querySelector('#price-to');
const availableCheckbox = document.querySelector('#only-available');
const catalogCount = document.querySelector('.catalog-count');
const catalogEmpty = document.querySelector('.catalog-empty');
const catalogEmptyText = document.querySelector('.catalog-empty__text');
const categoryLinks = document.querySelectorAll('.categories__link[data-category]');

const initialCatalogState = {
  query: '',
  category: 'all',
  priceFrom: null,
  priceTo: null,
  onlyAvailable: false,
  sort: 'default'
};

const catalogState = { ...initialCatalogState };

/* ===== Функции обработки данных (не трогают DOM) ===== */

function searchProducts(items, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery === '') {
    return items;
  }

  return items.filter((product) => product.title.toLowerCase().includes(normalizedQuery));
}

function filterProductsByCategory(items, category) {
  if (category === 'all') {
    return items;
  }

  return items.filter((product) => product.category === category);
}

function filterProductsByPrice(items, priceFrom, priceTo) {
  return items.filter((product) => {
    const isAboveMin = priceFrom === null || product.price >= priceFrom;
    const isBelowMax = priceTo === null || product.price <= priceTo;

    return isAboveMin && isBelowMax;
  });
}

function filterAvailableProducts(items, onlyAvailable) {
  return onlyAvailable ? items.filter((product) => product.isAvailable) : items;
}

// Сортируем копию массива, исходный порядок products не меняется
function sortProducts(items, sortType) {
  const productsCopy = [...items];

  if (sortType === 'price-asc') {
    return productsCopy.sort((a, b) => a.price - b.price);
  }

  if (sortType === 'price-desc') {
    return productsCopy.sort((a, b) => b.price - a.price);
  }

  if (sortType === 'title-asc') {
    return productsCopy.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  }

  return productsCopy;
}

function getPreparedProducts(items, state) {
  let result = searchProducts(items, state.query);

  result = filterProductsByCategory(result, state.category);
  result = filterProductsByPrice(result, state.priceFrom, state.priceTo);
  result = filterAvailableProducts(result, state.onlyAvailable);

  return sortProducts(result, state.sort);
}

function calculateDiscountPercent(product) {
  if (!product.oldPrice) {
    return 0;
  }

  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
}

function countActiveFilters(state) {
  let count = 0;

  if (state.category !== 'all') count += 1;
  if (state.priceFrom !== null) count += 1;
  if (state.priceTo !== null) count += 1;
  if (state.onlyAvailable) count += 1;

  return count;
}

/* ===== Создание карточки товара ===== */

const cardImageSizes = '(min-width: 1280px) 260px, (min-width: 1024px) 330px, (min-width: 560px) 46vw, 92vw';

function createSrcset(image, format) {
  return [400, 800, 1200].map((width) => `images/${image}-${width}.${format} ${width}w`).join(', ');
}

function createProductPicture(product, index) {
  const picture = document.createElement('picture');

  const source = document.createElement('source');
  source.type = 'image/webp';
  source.srcset = createSrcset(product.image, 'webp');
  source.sizes = cardImageSizes;

  const image = document.createElement('img');
  image.classList.add('product-card__image');
  image.src = `images/${product.image}-800.jpg`;
  image.srcset = createSrcset(product.image, 'jpg');
  image.sizes = cardImageSizes;
  image.alt = product.title;
  image.width = 400;
  image.height = 300;
  image.decoding = 'async';

  // Первые карточки видны сразу, остальные грузим лениво
  if (index > 1) {
    image.loading = 'lazy';
  }

  picture.append(source, image);
  return picture;
}

function createProductBadge(product) {
  const badgeTexts = {
    hit: 'Хит',
    new: 'Новинка',
    sale: `−${calculateDiscountPercent(product)}%`
  };

  const badge = document.createElement('span');
  badge.classList.add('product-card__badge', `product-card__badge--${product.badge}`);
  badge.textContent = badgeTexts[product.badge];

  return badge;
}

function createProductCard(product, index) {
  const card = document.createElement('article');
  card.classList.add('product-card');

  if (product.badge === 'hit') {
    card.classList.add('product-card--featured');
  }

  if (product.oldPrice) {
    card.classList.add('product-card--discount');
  }

  if (!product.isAvailable) {
    card.classList.add('product-card--unavailable');
  }

  if (product.badge) {
    card.append(createProductBadge(product));
  }

  const category = document.createElement('p');
  category.classList.add('product-card__category');
  category.textContent = categoryNames[product.category];

  const title = document.createElement('h3');
  title.classList.add('product-card__title');
  title.textContent = product.title;

  const description = document.createElement('p');
  description.classList.add('product-card__description');
  description.textContent = product.description;

  const price = document.createElement('p');
  price.classList.add('product-card__price');
  price.textContent = formatPrice(product.price);

  if (product.oldPrice) {
    const oldPrice = document.createElement('s');
    oldPrice.classList.add('product-card__old-price');
    oldPrice.textContent = formatPrice(product.oldPrice);
    price.append(' ', oldPrice);
  }

  const status = document.createElement('p');
  status.classList.add('product-card__status');
  status.classList.add(product.isAvailable ? 'product-card__status--in-stock' : 'product-card__status--out');
  status.textContent = product.isAvailable ? 'В наличии' : 'Нет в наличии';

  const actions = document.createElement('div');
  actions.classList.add('product-card__actions');

  if (product.page) {
    const moreLink = document.createElement('a');
    moreLink.classList.add('button', 'button--secondary', 'button--small');
    moreLink.href = product.page;
    moreLink.textContent = 'Подробнее';
    actions.append(moreLink);
  }

  const cartButton = document.createElement('button');
  cartButton.classList.add('button', 'button--primary', 'button--small');
  cartButton.type = 'button';
  cartButton.dataset.action = 'add-to-cart';
  cartButton.dataset.productId = String(product.id);
  cartButton.textContent = 'В корзину';

  if (!product.isAvailable) {
    cartButton.disabled = true;
    cartButton.textContent = 'Недоступно';
  }

  actions.append(cartButton);

  card.append(createProductPicture(product, index), category, title, description, price, status, actions);
  return card;
}

/* ===== Рендер ===== */

function getEmptyStateText(state) {
  const parts = [];

  if (state.query.trim() !== '') {
    parts.push(`по запросу «${state.query.trim()}»`);
  }

  if (state.category !== 'all') {
    parts.push(`в категории «${categoryNames[state.category]}»`);
  }

  if (state.priceFrom !== null || state.priceTo !== null) {
    parts.push('в выбранном диапазоне цен');
  }

  const conditions = parts.length > 0 ? ` ${parts.join(' ')}` : '';
  return `Товаров${conditions} не найдено. Измените запрос или сбросьте фильтры.`;
}

function renderProducts(productsToRender) {
  productsContainer.textContent = '';

  productsToRender.forEach((product, index) => {
    productsContainer.append(createProductCard(product, index));
  });

  const count = productsToRender.length;
  catalogCount.textContent = `Найдено: ${count} ${pluralize(count, ['товар', 'товара', 'товаров'])}`;

  catalogEmpty.hidden = count > 0;

  if (count === 0) {
    // Запрос пользователя выводится через textContent, а не innerHTML
    catalogEmptyText.textContent = getEmptyStateText(catalogState);
  }
}

function renderFiltersBadge() {
  const activeCount = countActiveFilters(catalogState);

  filtersBadge.textContent = '';
  filtersBadge.hidden = activeCount === 0;

  if (activeCount > 0) {
    const hiddenText = document.createElement('span');
    hiddenText.classList.add('visually-hidden');
    hiddenText.textContent = ' активно';
    filtersBadge.append(String(activeCount), hiddenText);
  }
}

function renderCategoryLinks() {
  categoryLinks.forEach((link) => {
    const isActive = link.dataset.category === catalogState.category;

    link.classList.toggle('categories__link--active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function updateCatalog() {
  const preparedProducts = getPreparedProducts(products, catalogState);

  renderProducts(preparedProducts);
  renderFiltersBadge();
  renderCategoryLinks();
}

// Переносит состояние в элементы управления (после сброса или чтения URL)
function syncControlsWithState() {
  searchInput.value = catalogState.query;
  sortSelect.value = catalogState.sort;
  categoryFilter.value = catalogState.category;
  priceFromInput.value = catalogState.priceFrom ?? '';
  priceToInput.value = catalogState.priceTo ?? '';
  availableCheckbox.checked = catalogState.onlyAvailable;
}

function readPriceInput(input) {
  return input.value === '' ? null : Number(input.value);
}

function resetCatalog() {
  Object.assign(catalogState, initialCatalogState);
  syncControlsWithState();
  history.replaceState(null, '', 'catalog.html');
  updateCatalog();
}

/* ===== События ===== */

if (productsContainer) {
  searchInput.addEventListener('input', (event) => {
    catalogState.query = event.target.value;
    updateCatalog();
  });

  sortSelect.addEventListener('change', (event) => {
    catalogState.sort = event.target.value;
    updateCatalog();
  });

  categoryFilter.addEventListener('change', (event) => {
    catalogState.category = event.target.value;
    updateCatalog();
  });

  priceFromInput.addEventListener('input', () => {
    catalogState.priceFrom = readPriceInput(priceFromInput);
    updateCatalog();
  });

  priceToInput.addEventListener('input', () => {
    catalogState.priceTo = readPriceInput(priceToInput);
    updateCatalog();
  });

  availableCheckbox.addEventListener('change', (event) => {
    catalogState.onlyAvailable = event.target.checked;
    updateCatalog();
  });

  // Кнопка «Фильтры» на мобильном раскрывает и сворачивает панель
  filtersToggle.addEventListener('click', () => {
    const isOpen = filtersToggle.getAttribute('aria-expanded') === 'true';

    filtersToggle.setAttribute('aria-expanded', String(!isOpen));
    filtersPanel.classList.toggle('catalog-filters--open', !isOpen);
  });

  // «Показать» на мобильном сворачивает панель и прокручивает к товарам
  filtersForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!desktopQuery.matches) {
      filtersToggle.setAttribute('aria-expanded', 'false');
      filtersPanel.classList.remove('catalog-filters--open');
      document.querySelector('#products-title').scrollIntoView();
    }
  });

  filtersForm.addEventListener('reset', (event) => {
    event.preventDefault();
    resetCatalog();
  });

  catalogEmpty.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="reset-catalog"]')) {
      resetCatalog();
      searchInput.focus();
    }
  });

  categoryLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      catalogState.category = link.dataset.category;
      categoryFilter.value = catalogState.category;
      updateCatalog();

      const url = catalogState.category === 'all' ? 'catalog.html' : `catalog.html?category=${catalogState.category}`;
      history.replaceState(null, '', url);
    });
  });

  // Ссылка вида catalog.html?category=plants сразу открывает нужную категорию
  const categoryFromUrl = new URLSearchParams(window.location.search).get('category');

  if (categoryFromUrl && categoryNames[categoryFromUrl]) {
    catalogState.category = categoryFromUrl;
  }

  syncControlsWithState();
  updateCatalog();
}
