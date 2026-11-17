/*
  validation.js — проверка форм (заявка, быстрая заявка в модальном окне, обратная связь).
  Ошибки выводятся рядом с полями через textContent, общий результат — в блоке статуса формы.
  alert() не используется. После успешной проверки — имитация отправки
  и событие form:sent, на которое подписаны корзина и модальное окно.
*/

const SEND_DELAY = 1000;

/* ===== Правила проверки: функция получает поле и возвращает текст ошибки или '' ===== */

function validateName(field) {
  const value = field.value.trim();

  if (value === '') {
    return 'Введите имя.';
  }

  if (value.length < 2) {
    return 'Имя должно содержать минимум 2 символа.';
  }

  if (!/^[A-Za-zА-Яа-яЁё\s-]+$/.test(value)) {
    return 'Имя может содержать только буквы, пробел и дефис.';
  }

  return '';
}

function validateEmail(field) {
  const value = field.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (value === '') {
    return 'Введите e-mail.';
  }

  if (!emailPattern.test(value)) {
    return 'Введите e-mail в формате name@example.ru.';
  }

  return '';
}

function getPhoneDigits(value) {
  return value.replace(/\D/g, '');
}

function validatePhone(field) {
  const digits = getPhoneDigits(field.value);

  if (digits === '') {
    return 'Введите телефон.';
  }

  const isRussianNumber = (digits.length === 11 && /^[78]/.test(digits)) || (digits.length === 10 && digits[0] === '9');

  if (!isRussianNumber) {
    return 'Номер должен содержать 11 цифр, например +7 (900) 000-00-00.';
  }

  return '';
}

function validateQuantity(field) {
  const value = Number(field.value);

  if (field.value === '' || !Number.isInteger(value) || value < 1 || value > 10) {
    return 'Укажите количество от 1 до 10.';
  }

  return '';
}

function validateDate(field) {
  if (field.value === '') {
    return '';
  }

  const today = new Date().toISOString().slice(0, 10);

  if (field.value < today) {
    return 'Дата доставки не может быть в прошлом.';
  }

  return '';
}

function validateMessage(field) {
  if (field.value.trim().length < 10) {
    return 'Напишите сообщение — минимум 10 символов.';
  }

  return '';
}

function validateAgreement(field) {
  return field.checked ? '' : 'Нужно согласие на обработку персональных данных.';
}

// Правило выбирается по атрибуту name поля
const validators = {
  name: validateName,
  email: validateEmail,
  phone: validatePhone,
  quantity: validateQuantity,
  date: validateDate,
  message: validateMessage,
  agreement: validateAgreement
};

function getFieldError(field) {
  // Скрытые поля (например, выбор товара, когда заявка идёт из корзины) не проверяем
  if (field.type === 'hidden' || field.closest('[hidden]')) {
    return '';
  }

  const validator = validators[field.name];

  if (validator) {
    return validator(field);
  }

  if (field.required && field.value.trim() === '') {
    return field.dataset.error || 'Заполните поле.';
  }

  return '';
}

/* ===== Вывод ошибок ===== */

function getErrorElement(field) {
  const errorId = `${field.id}-error`;
  let error = document.getElementById(errorId);

  if (!error) {
    error = document.createElement('span');
    error.classList.add('order-form__error');
    error.id = errorId;
    error.hidden = true;
    field.closest('.order-form__field').append(error);

    const describedBy = field.getAttribute('aria-describedby');
    field.setAttribute('aria-describedby', describedBy ? `${describedBy} ${errorId}` : errorId);
  }

  return error;
}

function showError(field, message) {
  const error = getErrorElement(field);

  field.setAttribute('aria-invalid', 'true');
  error.textContent = message;
  error.hidden = false;
}

function clearError(field) {
  field.removeAttribute('aria-invalid');

  const error = document.getElementById(`${field.id}-error`);

  if (error) {
    error.textContent = '';
    error.hidden = true;
  }
}

function checkField(field) {
  const message = getFieldError(field);

  if (message) {
    showError(field, message);
  } else {
    clearError(field);
  }

  return message === '';
}

function getFormStatus(form) {
  let status = form.querySelector('.form-status');

  if (!status) {
    status = document.createElement('p');
    status.classList.add('form-status');
    status.setAttribute('role', 'status');
    form.querySelector('.order-form__actions').before(status);
  }

  return status;
}

function setFormStatus(form, text, type) {
  const status = getFormStatus(form);

  status.textContent = text;
  status.classList.toggle('form-status--error', type === 'error');
  status.classList.toggle('form-status--success', type === 'success');
}

/* ===== Телефон: форматирование отдельно от проверки ===== */

function formatPhone(value) {
  let digits = getPhoneDigits(value);

  if (digits.length === 10 && digits[0] === '9') {
    digits = `7${digits}`;
  }

  if (digits.length !== 11 || !/^[78]/.test(digits)) {
    return value;
  }

  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

/* ===== Сообщение об успехе ===== */

function createSuccessMessage(form) {
  const formData = new FormData(form);
  const name = formData.get('name').trim();

  if (form.id === 'feedback-form') {
    return `Спасибо, ${name}! Сообщение отправлено, ответим на ${formData.get('email').trim()} в течение дня.`;
  }

  return `Спасибо, ${name}! Заявка подготовлена — флорист перезвонит на номер ${formatPhone(formData.get('phone'))}.`;
}

/* ===== Подключение к формам ===== */

function setupForm(form) {
  const fields = Array.from(form.elements).filter((element) => element.name && element.id);
  const submitButton = form.querySelector('[type="submit"]');
  const submitText = submitButton.textContent;

  // Исправленное поле сразу теряет ошибку
  form.addEventListener('input', (event) => {
    const field = event.target;

    if (field.getAttribute('aria-invalid') === 'true' && getFieldError(field) === '') {
      clearError(field);
    }
  });

  // Заполненное поле проверяется, когда пользователь уходит из него
  form.addEventListener('focusout', (event) => {
    const field = event.target;

    if (field.name === 'phone') {
      field.value = formatPhone(field.value);
    }

    if (fields.includes(field) && field.type !== 'checkbox' && field.value.trim() !== '') {
      checkField(field);
    }
  });

  form.addEventListener('reset', () => {
    fields.forEach(clearError);
    setFormStatus(form, '', null);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const invalidFields = fields.filter((field) => !checkField(field));

    if (invalidFields.length > 0) {
      const count = invalidFields.length;
      setFormStatus(form, `Проверьте форму: ${count} ${pluralize(count, ['поле заполнено', 'поля заполнены', 'полей заполнено'])} с ошибкой.`, 'error');
      invalidFields[0].focus();
      return;
    }

    // Имитация отправки: блокируем кнопку, через секунду показываем результат
    const message = createSuccessMessage(form);

    submitButton.disabled = true;
    submitButton.textContent = 'Отправляем…';
    form.setAttribute('aria-busy', 'true');
    setFormStatus(form, '', null);

    setTimeout(() => {
      form.reset();
      submitButton.disabled = false;
      submitButton.textContent = submitText;
      form.removeAttribute('aria-busy');
      setFormStatus(form, message, 'success');

      form.dispatchEvent(new CustomEvent('form:sent', { detail: { message } }));
    }, SEND_DELAY);
  });
}

/* ===== Список товаров в форме заявки строится из массива products ===== */

function fillProductSelect(select) {
  products.forEach((product) => {
    const option = document.createElement('option');

    option.value = String(product.id);
    option.textContent = product.isAvailable
      ? `${product.title} — ${formatPrice(product.price)}`
      : `${product.title} (нет в наличии)`;
    option.disabled = !product.isAvailable;

    select.append(option);
  });

  // order.html?product=3 — товар выбран заранее (ссылки со страниц товаров)
  const productFromUrl = new URLSearchParams(window.location.search).get('product');

  if (productFromUrl) {
    select.value = productFromUrl;
  }
}

const productSelect = document.querySelector('#page-product');

if (productSelect) {
  fillProductSelect(productSelect);
}

document.querySelectorAll('.order-form').forEach(setupForm);
