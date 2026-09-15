const TOAST_LIFETIME = 7000;

let container = null;
let activeToast = null;
let hideTimer = null;

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

export function hideToast() {
  clearTimeout(hideTimer);
  activeToast?.remove();
  activeToast = null;
}

function startTimer() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideToast, TOAST_LIFETIME);
}

/**
 * Показывает всплывающее сообщение об ошибке.
 * На экране всегда не больше одного уведомления: новое заменяет предыдущее.
 * Уведомление само скрывается через TOAST_LIFETIME (пауза, пока на нём курсор или фокус).
 *
 * Принимает строку или объект { title, text, actionLabel, onAction }.
 */
export function showToast(options) {
  const { title, text, actionLabel, onAction } =
    typeof options === 'string' ? { text: options } : options;

  hideToast();

  const toast = document.createElement('div');
  toast.className = 'toast';

  const content = document.createElement('div');
  content.className = 'toast__content';

  if (title) {
    const heading = document.createElement('p');
    heading.className = 'toast__title';
    heading.textContent = title;
    content.append(heading);
  }

  const message = document.createElement('p');
  message.className = 'toast__text';
  message.textContent = text;
  content.append(message);

  if (actionLabel) {
    const actionButton = document.createElement('button');
    actionButton.type = 'button';
    actionButton.className = 'button button_danger toast__action';
    actionButton.textContent = actionLabel;
    actionButton.addEventListener('click', () => {
      hideToast();
      onAction?.();
    });
    content.append(actionButton);
  }

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'toast__close';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', 'Закрыть уведомление');
  closeButton.addEventListener('click', hideToast);

  toast.append(content, closeButton);

  // Таймер снова идёт, только когда на уведомлении нет ни курсора, ни фокуса
  const resumeTimer = (event) => {
    const isHovered = event.type !== 'mouseleave' && toast.matches(':hover');
    const isFocused =
      event.type === 'focusout'
        ? toast.contains(event.relatedTarget)
        : toast.contains(document.activeElement);

    if (activeToast === toast && !isHovered && !isFocused) startTimer();
  };

  toast.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  toast.addEventListener('focusin', () => clearTimeout(hideTimer));
  toast.addEventListener('mouseleave', resumeTimer);
  toast.addEventListener('focusout', resumeTimer);

  getContainer().append(toast);
  activeToast = toast;
  startTimer();
}
