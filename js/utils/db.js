import { openDB } from 'idb';

const DB_NAME = 'quizzes-db';
const DB_VERSION = 1;

export const QUIZZES_STORE = 'quizzes';

let databasePromise;

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(QUIZZES_STORE)) {
          database.createObjectStore(QUIZZES_STORE, { keyPath: 'id' });
        }
      },
    }).catch((error) => {
      databasePromise = undefined;
      throw error;
    });
  }

  return databasePromise;
}
