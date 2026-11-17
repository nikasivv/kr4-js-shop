/*
  modal.js — модальное окно «Быстрая заявка» на главной странице (<dialog>).
  Открывается кнопками «Заказать», закрывается крестиком, Esc, кликом по фону
  и после успешной отправки формы. Фокус возвращается на кнопку, открывшую окно.
*/

const orderDialog = document.querySelector('#order-dialog');

if (orderDialog) {
  const openButtons = document.querySelectorAll('[data-open-dialog]');
  const closeButtons = orderDialog.querySelectorAll('[data-close-dialog]');
  const selectedProductInput = orderDialog.querySelector('#selected-product');
  const selectedProductName = orderDialog.querySelector('#selected-product-name');
  const dialogForm = orderDialog.querySelector('form');
  let dialogOpener = null;

  openButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const product = findProductById(Number(button.dataset.productId));

      selectedProductInput.value = String(product.id);
      selectedProductName.textContent = product.title;
      dialogOpener = button;

      orderDialog.showModal();
      dialogForm.querySelector('input:not([type="hidden"])').focus();
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => orderDialog.close());
  });

  // Клик по затемнённому фону (сам <dialog>, а не его содержимое) закрывает окно
  orderDialog.addEventListener('click', (event) => {
    if (event.target === orderDialog) {
      orderDialog.close();
    }
  });

  orderDialog.addEventListener('close', () => {
    if (dialogOpener) {
      dialogOpener.focus();
    }
  });

  dialogForm.addEventListener('form:sent', (event) => {
    orderDialog.close();
    showMessage(event.detail.message);
    // Сообщение уже показано на странице — при следующем открытии окно чистое
    dialogForm.querySelector('.form-status').textContent = '';
  });
}
