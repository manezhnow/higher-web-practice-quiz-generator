import { renderHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { saveQuiz } from '../utils/storage.js';
import { validateQuizJson } from '../utils/validation.js';

renderHeader(document.querySelector('#header'));

const form = document.querySelector('#generator-form');
const jsonField = document.querySelector('#quiz-json');
const errorBanner = document.querySelector('#json-error');
const errorText = document.querySelector('#json-error-text');
const retryButton = document.querySelector('#json-error-retry');
const submitButton = form.querySelector('[type="submit"]');
const errorModal = document.querySelector('#error-modal');
const errorMessage = document.querySelector('#error-message');

errorModal.addEventListener('close', () => jsonField.focus());

function hideError() {
  errorBanner.hidden = true;
  errorText.textContent = '';
  jsonField.classList.remove('field__control_invalid');
  jsonField.removeAttribute('aria-invalid');
}

function showError(message) {
  errorText.textContent = message;
  errorBanner.hidden = false;
  jsonField.classList.add('field__control_invalid');
  jsonField.setAttribute('aria-invalid', 'true');
  showToast('Не удалось создать квиз — проверьте JSON');
  errorMessage.textContent = message;
  errorModal.showModal();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submitButton.disabled) return;
  hideError();

  const result = validateQuizJson(jsonField.value);

  if (!result.isValid) {
    showError(result.error);

    return;
  }

  submitButton.disabled = true;

  try {
    await saveQuiz(result.data);
    window.location.assign('./quizzes.html');
  } catch (error) {
    showError(`Не удалось сохранить квиз в хранилище: ${error.message}`);
  } finally {
    submitButton.disabled = false;
  }
});

jsonField.addEventListener('input', hideError);

retryButton.addEventListener('click', () => {
  hideError();
  jsonField.focus();
});
