/**
 * Проверяет ответ на вопрос.
 * @param {object} question вопрос из квиза
 * @param {number|string|Array<number|string>} answer id выбранного варианта или массив id
 * @returns {{isCorrect: boolean, texts: {id: number, message: string, isSuccess: boolean}[]}}
 */
export function checkAnswer(question, answer) {
  const selectedIds = (Array.isArray(answer) ? answer : [answer]).map((id) =>
    typeof id === 'string' && id.trim() !== '' ? Number(id) : id,
  );
  const correctIds = question.options.filter((option) => option.correct).map((option) => option.id);

  const isCorrect =
    selectedIds.length === correctIds.length && correctIds.every((id) => selectedIds.includes(id));

  // Показываем пояснения к правильным вариантам и к тем, что выбрал пользователь
  const texts = question.options
    .filter((option) => option.correct || selectedIds.includes(option.id))
    .map((option) => ({
      id: option.id,
      message: option.message,
      isSuccess: option.correct,
    }));

  return { isCorrect, texts };
}

/**
 * Итоговая строка под вариантами: нужна там, где одного пояснения к варианту мало —
 * когда в множественном выборе отмечена только часть правильных ответов.
 */
export function getAnswerSummary(question, result, selectedIds) {
  if (result.isCorrect) {
    return 'Верно!';
  }

  if (question.type !== 'multiple') {
    return 'Ответ неверный. Правильный вариант отмечен в списке.';
  }

  const hasCorrectPicks = question.options.some(
    (option) => option.correct && selectedIds.includes(option.id),
  );

  const hasWrongPicks = question.options.some(
    (option) => !option.correct && selectedIds.includes(option.id),
  );

  if (hasCorrectPicks && hasWrongPicks) {
    return 'Среди выбранных ответов есть неверные. Сверьтесь с правильными вариантами.';
  }

  return hasCorrectPicks
    ? 'Часть ответов верна, но отмечены не все правильные варианты.'
    : 'Ответ неверный — ни один из отмеченных вариантов не подходит.';
}
