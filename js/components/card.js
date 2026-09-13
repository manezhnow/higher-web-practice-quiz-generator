const QUESTION_FORMS = ['вопрос', 'вопроса', 'вопросов'];

/**
 * Склоняет слово «вопрос» по числу: 1 вопрос, 2 вопроса, 5 вопросов.
 */
export function formatQuestionsCount(count) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  let form = QUESTION_FORMS[2];

  if (lastTwoDigits < 11 || lastTwoDigits > 14) {
    if (lastDigit === 1) {
      form = QUESTION_FORMS[0];
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      form = QUESTION_FORMS[1];
    }
  }

  return `${count} ${form}`;
}

/**
 * Собирает карточку квиза из <template> на странице списка.
 */
export function createQuizCard(quiz, template) {
  const card = template.content.cloneNode(true);
  const description = card.querySelector('.card__description');

  card.querySelector('.card__title').textContent = quiz.title;
  card.querySelector('.card__count').textContent = formatQuestionsCount(quiz.questions.length);

  const link = card.querySelector('.card__link');
  link.href = `./quiz.html?id=${encodeURIComponent(quiz.id)}`;
  link.setAttribute('aria-label', `Пройти квиз «${quiz.title}»`);

  if (quiz.description) {
    description.textContent = quiz.description;
  } else {
    description.textContent = 'Описание не указано.';
  }

  return card;
}
