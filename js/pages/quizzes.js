import { createQuizCard } from '../components/card.js';
import { renderHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { getAllQuizzes } from '../utils/storage.js';

renderHeader(document.querySelector('#header'));

const page = document.querySelector('#page');
const quizzesSection = document.querySelector('#quizzes');
const quizzesList = document.querySelector('#quizzes-list');
const emptyState = document.querySelector('#empty-state');
const cardTemplate = document.querySelector('#quiz-card-template');

function renderQuizzes(quizzes) {
  const hasQuizzes = quizzes.length > 0;

  quizzesSection.hidden = !hasQuizzes;
  emptyState.hidden = hasQuizzes;
  // Пустое состояние в макете отцентровано по вертикали, список — нет
  page.classList.toggle('page_centered', !hasQuizzes);

  if (!hasQuizzes) {
    return;
  }

  const cards = document.createDocumentFragment();
  quizzes.forEach((quiz) => cards.append(createQuizCard(quiz, cardTemplate)));
  quizzesList.replaceChildren(cards);
}

try {
  renderQuizzes(await getAllQuizzes());
} catch (error) {
  renderQuizzes([]);
  showToast(`Не удалось прочитать сохранённые квизы: ${error.message}`);
}
