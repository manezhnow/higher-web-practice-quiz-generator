import { renderHeader } from '../components/header.js';
import { createQuestion, getSelectedIds, revealAnswer } from '../components/question.js';
import { showToast } from '../components/toast.js';
import { checkAnswer, getAnswerSummary } from '../utils/answers.js';
import { getQuiz } from '../utils/storage.js';

const RESULT_VARIANTS = [
  {
    minRatio: 1,
    title: 'Тест завершён!',
    getScore: () => 'Вы ответили правильно на все вопросы 🎉',
    note: 'Отличный результат — тема теста вам явно знакома.',
  },
  {
    minRatio: 0.5,
    title: 'Хороший результат!',
    getScore: (score, total) => `Вы ответили правильно на ${score} из ${total} вопросов`,
    note: 'Загляните в вопросы, где ошиблись, и попробуйте пройти тест ещё раз.',
  },
  {
    minRatio: 0,
    title: 'Не расстраивайтесь!',
    getScore: (score, total) => `Вы ответили правильно только на ${score} из ${total} вопросов`,
    note: 'Стоит вернуться к материалу и пройти тест снова — со второго раза выходит лучше.',
  },
];

renderHeader(document.querySelector('#header'));

const quizSection = document.querySelector('#quiz');
const missingSection = document.querySelector('#quiz-missing');
const page = document.querySelector('#page');

const titleElement = document.querySelector('#quiz-title');
const descriptionElement = document.querySelector('#quiz-description');
const progressLabel = document.querySelector('#progress-label');
const progressTrack = document.querySelector('#progress-track');
const progressBar = document.querySelector('#progress-bar');
const form = document.querySelector('#quiz-form');
const questionSlot = document.querySelector('#question-slot');
const summaryElement = document.querySelector('#quiz-summary');
const submitButton = document.querySelector('#quiz-submit');

const resultModal = document.querySelector('#result-modal');
const resultTitle = document.querySelector('#result-title');
const resultScore = document.querySelector('#result-score');
const resultNote = document.querySelector('#result-note');
const restartButton = document.querySelector('#result-restart');

const templates = {
  single: document.querySelector('#single-question-template'),
  multiple: document.querySelector('#multiple-question-template'),
  option: document.querySelector('#option-template'),
  checkboxOption: document.querySelector('#checkbox-option-template'),
};

/** Разобранные ответы: индекс вопроса -> { isCorrect, selectedIds }. */
const answers = new Map();

let quiz = null;
let currentIndex = 0;
let questionElement = null;

function showMissingQuiz() {
  missingSection.hidden = false;
  page.classList.add('page_centered');
}

function getIndexFromUrl() {
  const rawNumber = Number(new URLSearchParams(window.location.search).get('question'));

  if (!Number.isInteger(rawNumber) || rawNumber < 1 || rawNumber > quiz.questions.length) {
    return 0;
  }

  return rawNumber - 1;
}

function writeIndexToUrl(index, { replace = false } = {}) {
  const url = new URL(window.location.href);
  url.searchParams.set('question', String(index + 1));

  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({ index }, '', url);
}

function isLastQuestion() {
  return currentIndex === quiz.questions.length - 1;
}

function updateSubmitButton() {
  if (!answers.has(currentIndex)) {
    submitButton.textContent = 'Ответить';

    return;
  }

  submitButton.textContent = isLastQuestion() ? 'Завершить тест' : 'Следующий вопрос';
}

function updateProgress() {
  const total = quiz.questions.length;
  const current = currentIndex + 1;

  progressLabel.textContent = `Вопрос ${current} из ${total}`;
  progressBar.style.width = `${(current / total) * 100}%`;
  progressTrack.setAttribute('aria-valuenow', String(current));
  progressTrack.setAttribute('aria-valuemax', String(total));
  progressTrack.setAttribute('aria-valuetext', `Вопрос ${current} из ${total}`);
}

function renderQuestion() {
  const question = quiz.questions[currentIndex];

  questionElement = createQuestion(question, templates);
  questionSlot.replaceChildren(questionElement);

  summaryElement.hidden = true;
  summaryElement.textContent = '';

  const answer = answers.get(currentIndex);

  if (answer) {
    // Вопрос уже разобран — восстанавливаем состояние, например после «назад» в браузере
    answer.selectedIds.forEach((id) => {
      const input = questionElement.querySelector(`.option__input[value="${id}"]`);

      if (input) {
        input.checked = true;
      }
    });

    const result = checkAnswer(question, answer.selectedIds);
    revealAnswer(questionElement, question, result, answer.selectedIds);
    showSummary(question, result, answer.selectedIds);
  }

  updateProgress();
  updateSubmitButton();
}

function showSummary(question, result, selectedIds) {
  const summary = getAnswerSummary(question, result, selectedIds);

  summaryElement.textContent = summary;
  summaryElement.hidden = summary === '';
  summaryElement.classList.toggle(
    'visually-hidden',
    question.type === 'single' || result.isCorrect,
  );
}

function goToQuestion(index) {
  currentIndex = index;
  writeIndexToUrl(index);
  renderQuestion();
  questionElement.querySelector('.question__text').focus();
}

function getScore() {
  return [...answers.values()].filter((answer) => answer.isCorrect).length;
}

function openResults() {
  const unansweredIndex = quiz.questions.findIndex((question, index) => !answers.has(index));

  if (unansweredIndex !== -1) {
    goToQuestion(unansweredIndex);
    showToast('Ответьте на оставшиеся вопросы, чтобы завершить тест.');
    return;
  }

  const total = quiz.questions.length;
  const score = getScore();
  const ratio = total === 0 ? 0 : score / total;
  const variant = RESULT_VARIANTS.find((candidate) => ratio >= candidate.minRatio);

  resultTitle.textContent = variant.title;
  resultScore.textContent = variant.getScore(score, total);
  resultNote.textContent = variant.note;
  resultModal.showModal();
  window.scrollTo(0, 0);
}

function restartQuiz() {
  answers.clear();
  resultModal.close();
  goToQuestion(0);
}

function submitAnswer() {
  const question = quiz.questions[currentIndex];
  const selectedIds = getSelectedIds(questionElement);

  if (selectedIds.length === 0) {
    showToast('Выберите вариант ответа');

    return;
  }

  const result = checkAnswer(question, selectedIds);

  answers.set(currentIndex, { isCorrect: result.isCorrect, selectedIds });
  revealAnswer(questionElement, question, result, selectedIds);
  showSummary(question, result, selectedIds);
  updateSubmitButton();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!answers.has(currentIndex)) {
    submitAnswer();

    return;
  }

  if (isLastQuestion()) {
    openResults();

    return;
  }

  goToQuestion(currentIndex + 1);
});

restartButton.addEventListener('click', restartQuiz);

window.addEventListener('popstate', () => {
  if (!quiz) return;
  resultModal.close();
  currentIndex = getIndexFromUrl();
  writeIndexToUrl(currentIndex, { replace: true });
  renderQuestion();
});

const quizId = new URLSearchParams(window.location.search).get('id');

if (!quizId) {
  showMissingQuiz();
} else {
  try {
    quiz = await getQuiz(quizId);
  } catch (error) {
    showToast(`Не удалось прочитать квиз из хранилища: ${error.message}`);
  }

  if (!quiz) {
    showMissingQuiz();
  } else {
    document.title = `${quiz.title} — прохождение теста`;
    titleElement.textContent = quiz.title;

    if (quiz.description) {
      descriptionElement.textContent = quiz.description;
    } else {
      descriptionElement.remove();
    }

    quizSection.hidden = false;
    currentIndex = getIndexFromUrl();
    writeIndexToUrl(currentIndex, { replace: true });
    renderQuestion();
  }
}
