import { nanoid } from 'nanoid';

import { getDatabase, QUIZZES_STORE } from './db.js';

/**
 * Сохраняет квиз и возвращает сгенерированный идентификатор.
 * В исходном JSON идентификатора нет, поэтому создаём его через nanoid.
 */
export async function saveQuiz(quizData) {
  const db = await getDatabase();
  const id = nanoid();

  await db.put(QUIZZES_STORE, {
    ...quizData,
    id,
    createdAt: Date.now(),
  });

  return id;
}

export async function getQuiz(id) {
  const db = await getDatabase();

  return db.get(QUIZZES_STORE, id);
}

export async function getAllQuizzes() {
  const db = await getDatabase();
  const quizzes = await db.getAll(QUIZZES_STORE);

  return quizzes.sort((first, second) => second.createdAt - first.createdAt);
}
