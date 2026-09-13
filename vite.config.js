import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDirectory = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(rootDirectory, 'index.html'),
        quizzes: resolve(rootDirectory, 'quizzes.html'),
        quiz: resolve(rootDirectory, 'quiz.html'),
      },
    },
  },
  optimizeDeps: {
    include: ['idb', 'nanoid', 'zod'],
  },
});
