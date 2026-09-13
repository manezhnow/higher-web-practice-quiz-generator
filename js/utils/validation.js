import { z } from 'zod';

const optionSchema = z.object({
  id: z.number().int(),
  text: z.string().trim().min(1, 'текст варианта не может быть пустым'),
  correct: z.boolean(),
  message: z.string().trim().min(1, 'пояснение к варианту не может быть пустым'),
});

const questionSchema = z
  .object({
    id: z.number().int(),
    text: z.string().trim().min(1, 'текст вопроса не может быть пустым'),
    type: z.enum(['single', 'multiple']),
    options: z.array(optionSchema).min(2, 'нужно минимум два варианта ответа'),
  })
  .refine(
    (question) =>
      new Set(question.options.map((option) => option.id)).size === question.options.length,
    {
      message: 'ID вариантов внутри вопроса должны быть уникальными',
      path: ['options'],
    },
  )
  .refine((question) => question.options.some((option) => option.correct), {
    message: 'хотя бы один вариант должен быть правильным',
    path: ['options'],
  })
  .refine(
    (question) =>
      question.type !== 'single' ||
      question.options.filter((option) => option.correct).length === 1,
    {
      message: 'у вопроса с одиночным выбором должен быть ровно один правильный вариант',
      path: ['options'],
    },
  );

export const quizSchema = z
  .object({
    title: z.string().trim().min(1, 'название теста не может быть пустым'),
    description: z.string().trim().optional(),
    questions: z.array(questionSchema).min(1, 'в тесте должен быть хотя бы один вопрос'),
  })
  .refine(
    (quiz) => new Set(quiz.questions.map((question) => question.id)).size === quiz.questions.length,
    {
      message: 'ID вопросов должны быть уникальными',
      path: ['questions'],
    },
  );

/**
 * Превращает путь Zod вида ['questions', 0, 'options', 1, 'text']
 * в читаемое «questions[0].options[1].text».
 */
function formatPath(path) {
  return path.reduce((result, segment) => {
    if (typeof segment === 'number') {
      return `${result}[${segment}]`;
    }

    return result ? `${result}.${segment}` : String(segment);
  }, '');
}

function formatIssues(issues) {
  return issues
    .map((issue) => {
      const path = formatPath(issue.path);

      const message =
        issue.code === 'invalid_type'
          ? 'поле обязательно и должно иметь корректный тип'
          : issue.code === 'invalid_value'
            ? 'допустимые значения: single или multiple'
            : issue.message;

      return path ? `${path}: ${message}` : message;
    })
    .join('\n');
}

/**
 * Проверяет строку из textarea: сначала синтаксис JSON, затем структуру данных.
 * Возвращает { isValid: true, data } либо { isValid: false, error }.
 */
export function validateQuizJson(jsonString) {
  if (!jsonString.trim()) {
    return { isValid: false, error: 'Поле пустое — вставьте JSON с описанием теста.' };
  }

  let parsedJson;

  try {
    parsedJson = JSON.parse(jsonString);
  } catch (error) {
    return { isValid: false, error: `Не удалось разобрать JSON: ${error.message}` };
  }

  if (parsedJson === null || typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
    return { isValid: false, error: 'Ожидается объект с полями title и questions.' };
  }

  const result = quizSchema.safeParse(parsedJson);

  if (!result.success) {
    return { isValid: false, error: formatIssues(result.error.issues) };
  }

  return { isValid: true, data: result.data };
}
