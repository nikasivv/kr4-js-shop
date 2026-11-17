/*
  cart.js — корзина:
  состояние корзины в localStorage, добавление/удаление товаров, расчёт суммы через reduce,
  промокод, счётчик в шапке, страница cart.html и состав заявки на order.html.
*/

const CART_KEY = 'florashop-cart';
const PROMO_KEY = 'florashop-promo';
const MAX_QUANTITY = 10;

// Учебные промокоды: код → скидка в процентах
const promoCodes = {
  FLORA10: 10,
  VESNA15: 15
};

/* ===== Хранение ===== */

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch (error) {
    console.warn(`Не удалось прочитать ${key} из localStorage`, error);
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Не удалось сохранить ${key} в localStorage`, error);
  }
}

// В корзине храним только id и количество; остальные данные берём из products
let cart = loadFromStorage(CART_KEY, []).filter((item) => findProductById(item.id));
let promoCode = loadFromStorage(PROMO_KEY, null);

function saveCart() {
  saveToStorage(CART_KEY, cart);
  saveToStorage(PROMO_KEY, promoCode);
}

/* ===== Изменение корзины ===== */

function addToCart(productId) {
  const product = findProductById(productId);

  if (!product || !product.isAvailable) {
    return;
  }

  const item = cart.find((cartItem) => cartItem.id === productId);

  if (item && item.quantity >= MAX_QUANTITY) {
    showMessage(`«${product.title}»: не больше ${MAX_QUANTITY} шт. в одном заказе.`);
    return;
  }

  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  renderCart();
  showMessage(`«${product.title}» добавлен в корзину.`);
}

function changeQuantity(productId, delta) {
  const item = cart.find((cartItem) => cartItem.id === productId);

  if (!item) {
    return;
  }

  const newQuantity = item.quantity + delta;

  if (newQuantity < 1) {
    removeFromCart(productId);
    return;
  }

  item.quantity = Math.min(newQuantity, MAX_QUANTITY);
  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  const product = findProductById(productId);

  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
  showMessage(`«${product.title}» удалён из корзины.`);
}

function clearCart() {
  cart = [];
  promoCode = null;
  saveCart();
  renderCart();
}

/* ===== Расчёты ===== */

function getCartItems() {
  return cart.map((item) => ({ ...findProductById(item.id), quantity: item.quantity }));
}

function calculateCartCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function calculateCartSubtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calculatePromoDiscount(subtotal, code) {
  const percent = promoCodes[code] ?? 0;
  return Math.round((subtotal * percent) / 100);
}

function getCartTotals() {
  const items = getCartItems();
  const subtotal = calculateCartSubtotal(items);
  const discount = calculatePromoDiscount(subtotal, promoCode);

  return {
    items,
    count: calculateCartCount(items),
    subtotal,
    discount,
    total: subtotal - discount
  };
}

/* ===== Рендер ===== */

const cartCounters = document.querySelectorAll('.cart-link__count');
const cartList = document.querySelector('[data-cart-list]');
const cartEmpty = document.querySelector('.cart-empty');
const cartSummary = document.querySelector('.cart-summary');
const promoForm = document.querySelector('#promo-form');
const promoInput = document.querySelector('#promo-code');
const promoMessage = document.querySelector('.promo-form__message');
const orderCart = document.querySelector('[data-order-cart]');

function renderCartCounter(count) {
  cartCounters.forEach((counter) => {
    counter.textContent = String(count);
    counter.hidden = count === 0;
  });
}

function createQuantityButton(action, text, label, productId) {
  const button = document.createElement('button');
  button.classList.add('cart-item__qty-button');
  button.type = 'button';
  button.dataset.action = action;
  button.dataset.productId = String(productId);
  button.setAttribute('aria-label', label);
  button.textContent = text;
  return button;
}

function createCartItem(item) {
  const listItem = document.createElement('li');
  listItem.classList.add('cart-item');

  const image = document.createElement('img');
  image.classList.add('cart-item__image');
  image.src = `images/${item.image}-400.jpg`;
  image.alt = '';
  image.width = 400;
  image.height = 300;

  const info = document.createElement('div');
  info.classList.add('cart-item__info');

  const title = document.createElement(item.page ? 'a' : 'p');
  title.classList.add('cart-item__title');
  title.textContent = item.title;

  if (item.page) {
    title.href = item.page;
  }

  const price = document.createElement('p');
  price.classList.add('cart-item__price');
  price.textContent = `${formatPrice(item.price)} за шт.`;

  info.append(title, price);

  const quantity = document.createElement('div');
  quantity.classList.add('cart-item__quantity');

  const quantityValue = document.createElement('span');
  quantityValue.classList.add('cart-item__qty-value');
  quantityValue.textContent = String(item.quantity);

  const increaseButton = createQuantityButton('increase', '+', `Увеличить количество: ${item.title}`, item.id);
  increaseButton.disabled = item.quantity >= MAX_QUANTITY;

  quantity.append(
    createQuantityButton('decrease', '−', `Уменьшить количество: ${item.title}`, item.id),
    quantityValue,
    increaseButton
  );

  const lineTotal = document.createElement('p');
  lineTotal.classList.add('cart-item__total');
  lineTotal.textContent = formatPrice(item.price * item.quantity);

  const removeButton = document.createElement('button');
  removeButton.classList.add('cart-item__remove');
  removeButton.type = 'button';
  removeButton.dataset.action = 'remove';
  removeButton.dataset.productId = String(item.id);
  removeButton.setAttribute('aria-label', `Удалить из корзины: ${item.title}`);
  removeButton.textContent = 'Удалить';

  listItem.append(image, info, quantity, lineTotal, removeButton);
  return listItem;
}

function renderCartPage(totals) {
  cartList.textContent = '';
  totals.items.forEach((item) => cartList.append(createCartItem(item)));

  const isEmpty = totals.items.length === 0;
  cartEmpty.hidden = !isEmpty;
  cartSummary.hidden = isEmpty;

  document.querySelector('[data-cart-count]').textContent =
    `${totals.count} ${pluralize(totals.count, ['товар', 'товара', 'товаров'])}`;
  document.querySelector('[data-cart-subtotal]').textContent = formatPrice(totals.subtotal);
  document.querySelector('[data-cart-discount]').textContent = `−${formatPrice(totals.discount)}`;
  document.querySelector('[data-cart-discount-row]').hidden = totals.discount === 0;
  document.querySelector('[data-cart-total]').textContent = formatPrice(totals.total);
}

// На странице заявки показываем состав корзины вместо выбора одного товара
function renderOrderCart(totals) {
  const hasItems = totals.items.length > 0;
  const singleProductFields = document.querySelectorAll('[data-single-product]');
  const list = orderCart.querySelector('[data-order-cart-list]');

  orderCart.hidden = !hasItems;
  singleProductFields.forEach((field) => {
    field.hidden = hasItems;
  });

  list.textContent = '';
  totals.items.forEach((item) => {
    const row = document.createElement('li');
    row.textContent = `${item.title} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`;
    list.append(row);
  });

  const discountText = totals.discount > 0 ? ` (с промокодом ${promoCode})` : '';
  orderCart.querySelector('[data-order-cart-total]').textContent = `Итого: ${formatPrice(totals.total)}${discountText}`;
}

function renderCart() {
  const totals = getCartTotals();

  renderCartCounter(totals.count);

  if (cartList) {
    renderCartPage(totals);
  }

  if (orderCart) {
    renderOrderCart(totals);
  }
}

/* ===== Промокод ===== */

function applyPromoCode(code) {
  const normalizedCode = code.trim().toUpperCase();

  promoMessage.classList.remove('promo-form__message--error');

  if (normalizedCode === '') {
    promoMessage.textContent = 'Введите промокод.';
    promoMessage.classList.add('promo-form__message--error');
    return;
  }

  if (!promoCodes[normalizedCode]) {
    // Введённый код выводится через textContent — HTML в нём не выполнится
    promoMessage.textContent = `Промокод «${code.trim()}» не найден.`;
    promoMessage.classList.add('promo-form__message--error');
    return;
  }

  promoCode = normalizedCode;
  saveCart();
  renderCart();
  promoMessage.textContent = `Промокод ${normalizedCode} применён: скидка ${promoCodes[normalizedCode]}%.`;
}

/* ===== События ===== */

// Делегирование: одна подписка обслуживает кнопки «В корзину» на любой странице,
// в том числе карточки, которые каталог создаёт заново при каждом рендере
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="add-to-cart"]');

  if (button) {
    addToCart(Number(button.dataset.productId));
  }
});

if (cartList) {
  cartList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');

    if (!button) {
      return;
    }

    const productId = Number(button.dataset.productId);

    if (button.dataset.action === 'increase') {
      changeQuantity(productId, 1);
    } else if (button.dataset.action === 'decrease') {
      changeQuantity(productId, -1);
    } else if (button.dataset.action === 'remove') {
      removeFromCart(productId);
    }

    // Список перерисован — возвращаем фокус на ту же кнопку или на ближайший элемент
    const sameButton = cartList.querySelector(
      `[data-action="${button.dataset.action}"][data-product-id="${productId}"]:not(:disabled)`
    );
    const fallback = cartList.querySelector('.cart-item__remove') || document.querySelector('.cart-empty a');
    (sameButton || fallback).focus();
  });

  document.querySelector('[data-action="clear-cart"]').addEventListener('click', () => {
    clearCart();
    showMessage('Корзина очищена.');
    document.querySelector('.cart-empty a').focus();
  });

  promoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    applyPromoCode(promoInput.value);
  });

  if (promoCode) {
    promoInput.value = promoCode;
    promoMessage.textContent = `Промокод ${promoCode} применён: скидка ${promoCodes[promoCode]}%.`;
  }
}

// После успешной заявки с товарами из корзины корзина очищается
if (orderCart) {
  document.querySelector('#order-page-form').addEventListener('form:sent', () => {
    if (!orderCart.hidden) {
      clearCart();
    }
  });
}

renderCart();
