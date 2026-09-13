# Quiz Generator

An app for creating and taking quizzes. You can import quizzes from JSON, browse saved quizzes and answer single-choice or multiple-choice questions with feedback and a final score. A study project built for Yandex Practicum.

**Author:** Roman Manezhnov

**Course:** Online master's programme in Frontend, Backend Development and AI Solutions

**Repository:** [higher-web-practice-quiz-generator](https://github.com/manezhnow/higher-web-practice-quiz-generator)

## Stack

Plain JavaScript with ES modules, BEM markup and Vite. Quiz data is validated with Zod, stored locally in IndexedDB using idb and assigned unique IDs with nanoid.

## Getting started

With Node.js 22.12+ installed, run:

```sh
npm install
npm run dev
```

Paste the contents of a JSON file from `quiz-examples` into the form to create your first quiz.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the dev server on [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Builds the production bundle into `dist` |
| `npm run preview` | Serves the production build locally for preview |
