const TOAST_LIFETIME = 5000;

let container = null;

function getContainer() {
  if (container) {
    return container;
  }

  container = document.createElement('div');
  container.className = 'toasts';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  document.body.append(container);

  return container;
}

/**
 * Показывает всплывающее сообщение об ошибке.
 */
export function showToast(text) {
  const toast = document.createElement('div');
  toast.className = 'toast';

  const message = document.createElement('p');
  message.className = 'toast__text';
  message.textContent = text;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'toast__close';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', 'Закрыть уведомление');
  closeButton.addEventListener('click', () => toast.remove());

  toast.append(message, closeButton);
  getContainer().append(toast);

  setTimeout(() => toast.remove(), TOAST_LIFETIME);
}
