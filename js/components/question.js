const HINTS = {
  single: 'Выберите один вариант ответа',
  multiple: 'Выберите несколько вариантов ответа',
};

function createOption(option, template) {
  const item = template.content.cloneNode(true);

  item.querySelector('.option__input').value = String(option.id);
  item.querySelector('.option__text').textContent = option.text;

  return item;
}

/**
 * Собирает вопрос из <template>: свой шаблон на одиночный и множественный выбор,
 * свой — на вариант ответа с radio и с checkbox.
 */
export function createQuestion(question, templates) {
  const isSingle = question.type === 'single';
  const fragment = (isSingle ? templates.single : templates.multiple).content.cloneNode(true);
  const element = fragment.querySelector('.question');

  element.querySelector('.question__text').textContent = question.text;
  element.querySelector('.question__text').id = 'question-title';
  element.querySelector('.question__text').tabIndex = -1;
  element.querySelector('.question__hint').id = 'question-hint';
  element.setAttribute('role', isSingle ? 'radiogroup' : 'group');
  element.setAttribute('aria-labelledby', 'question-title');
  element.setAttribute('aria-describedby', 'question-hint');
  element.querySelector('.question__hint').textContent = HINTS[question.type];

  const optionTemplate = isSingle ? templates.option : templates.checkboxOption;
  const list = element.querySelector('.question__options');
  question.options.forEach((option) => list.append(createOption(option, optionTemplate)));

  return element;
}

export function getSelectedIds(questionElement) {
  return [...questionElement.querySelectorAll('.option__input:checked')].map((input) =>
    Number(input.value),
  );
}

/**
 * Показывает разбор ответа: правильные варианты зелёные, ошибочно выбранные красные,
 * остальные гасим. Пояснения выводим только там, где они есть в разборе.
 */
export function revealAnswer(questionElement, question, result, selectedIds) {
  questionElement.querySelectorAll('.question__item').forEach((item) => {
    const input = item.querySelector('.option__input');
    const optionId = Number(input.value);
    const option = question.options.find((candidate) => candidate.id === optionId);
    const label = item.querySelector('.option');

    input.disabled = true;

    if (option.correct) {
      label.classList.add('option_correct');
    } else if (selectedIds.includes(optionId)) {
      label.classList.add('option_wrong');
    } else {
      label.classList.add('option_muted');
    }

    const text = result.texts.find((candidate) => candidate.id === optionId);

    if (text) {
      const message = item.querySelector('.question__message');
      message.textContent = text.message;
      message.hidden = false;
    }
  });
}
