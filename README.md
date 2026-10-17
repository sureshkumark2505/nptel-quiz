# Biodiversity for Sustainability Quiz

A responsive React, Vite, TypeScript, and Tailwind CSS quiz site for the 2026 Biodiversity for Sustainability assignments.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (normally `http://localhost:5173`).

## Verification commands

```bash
npm run validate:questions
npm test
npm run build
```

## Question bank and answer-key note

`src/data/questions.json` contains 120 extracted questions: 10 each for Assignments/Weeks 1 through 12. The supplied PDF titles each section "Solutions," but it does not visually mark any correct option or include a distinct answer-key table. Every `correctOptionId` is therefore marked `"inferred"`, based on the question wording, and should be manually verified against an official course key before high-stakes use.

The app intentionally stores attempts in React memory only. Refreshing the browser clears the current quiz; it does not use localStorage, cookies, sessionStorage, IndexedDB, or a backend.
