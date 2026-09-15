import { renderHeader } from '../components/header.js';
import { hideToast, showToast } from '../components/toast.js';
import { saveQuiz } from '../utils/storage.js';
import { validateQuizJson } from '../utils/validation.js';

renderHeader(document.querySelector('#header'));

const form = document.querySelector('#generator-form');
const jsonField = document.querySelector('#quiz-json');
const submitButton = form.querySelector('[type="submit"]');

function hideError() {
  jsonField.classList.remove('field__control_invalid');
  jsonField.removeAttribute('aria-invalid');
}

function showError(title, message) {
  jsonField.classList.add('field__control_invalid');
  jsonField.setAttribute('aria-invalid', 'true');
  showToast({
    title,
    text: message,
    actionLabel: 'Попробовать снова',
    onAction: () => {
      hideError();
      jsonField.focus();
    },
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submitButton.disabled) return;
  hideError();
  hideToast();

  const result = validateQuizJson(jsonField.value);

  if (!result.isValid) {
    showError('Ошибка парсинга JSON', result.error);

    return;
  }

  submitButton.disabled = true;

  try {
    await saveQuiz(result.data);
    window.location.assign('./quizzes.html');
  } catch (error) {
    showError('Ошибка сохранения', `Не удалось сохранить квиз в хранилище: ${error.message}`);
  } finally {
    submitButton.disabled = false;
  }
});

jsonField.addEventListener('input', hideError);
