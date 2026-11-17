/*
  main.js — общий код для всех страниц:
  вспомогательные функции (цена, склонение, сообщения) и мобильное меню.
  Подключается после data.js и раньше остальных скриптов.
*/

function formatPrice(price) {
  return `${price.toLocaleString('ru-RU')} ₽`;
}

// Склонение: pluralize(5, ['товар', 'товара', 'товаров']) → 'товаров'
function pluralize(number, forms) {
  const mod10 = number % 10;
  const mod100 = number % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return forms[0];
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return forms[1];
  }

  return forms[2];
}

function findProductById(id) {
  return products.find((product) => product.id === id);
}

/*
  Всплывающее сообщение внизу экрана вместо alert().
  Текст выводится через textContent, поэтому любые данные безопасны.
*/
const toastElement = document.querySelector('#success-message');
let toastTimer = null;

function showMessage(text) {
  if (!toastElement) {
    return;
  }

  toastElement.textContent = text;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastElement.textContent = '';
  }, 4000);
}

/* ===== Мобильное меню ===== */

const desktopQuery = window.matchMedia('(min-width: 1024px)');

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.getElementById('site-nav');

function setMenuOpen(isOpen, { returnFocus = false } = {}) {
  if (!menuToggle || !siteNav) {
    return;
  }

  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.querySelector('.menu-toggle__text').textContent = isOpen ? 'Закрыть' : 'Меню';
  siteNav.classList.toggle('site-nav--open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);

  if (isOpen) {
    siteNav.querySelector('a').focus();
  } else if (returnFocus) {
    menuToggle.focus();
  }
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteNav.classList.contains('site-nav--open')) {
      setMenuOpen(false, { returnFocus: true });
    }
  });

  document.addEventListener('click', (event) => {
    if (
      siteNav.classList.contains('site-nav--open') &&
      !siteNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });

  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setMenuOpen(false);
    }
  });

  siteNav.addEventListener('focusout', (event) => {
    const next = event.relatedTarget;

    if (next && !siteNav.contains(next) && next !== menuToggle && !desktopQuery.matches) {
      setMenuOpen(false);
    }
  });

  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) {
      setMenuOpen(false);
    }
  });
}
