# Точка Ру — Práctica

A Duolingo-style practice app for the Russian A1 textbook **Точка Ру** (Dolmatova & Novacac), with the interface in Spanish. It's an installable web app (PWA) that runs entirely in the browser, so it can be hosted on GitHub Pages.

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run validate   # check content files
npm run build      # production build in dist/
```

## How it works

- **Content**: there is one JSON file per book chapter in `content/chapters/chN.json`. Supplementary packs (class notes, extra exercises) go in `content/extra/*.json` and are merged into book lessons by lesson id. The format is described in [content/SCHEMA.md](content/SCHEMA.md).
- **Exercises**: the hand-made exercises in the content files are combined with exercises generated from the vocabulary and grammar: translations, listening, typed recall, antonyms, conjugation tables, adjective agreement, gender sorting, word order and reading questions (`src/engine/generate.ts`).
- **Daily lesson**: about 60% comes from this week's lesson, 30% is spaced-repetition review of earlier lessons, and 1–2 are ✨ extra words. Wrong answers come back at the end of the lesson (`src/engine/session.ts`).
- **Progress**: spaced repetition with Leitner boxes per word, grammar point and exercise, plus XP, streaks with freezes, and badges. It's stored in the browser (`localStorage`). Export/Import in Ajustes saves a backup file that can be kept in iCloud Drive or Google Drive.

## Adding a new chapter

1. Put the scans in `source-pdfs/`. This folder is git-ignored, so the scans are never published.
2. Extract the chapter into `content/chapters/chN.json` following `content/SCHEMA.md`. In the textbook PDF, page = book page + 2 from book p.41 on; in the workbook, page = book page + 2. Each workbook chapter ends with a **Словарь**.
3. Run `npm run validate`, then commit. Pushing to `main` redeploys the site.

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. In the repository, go to Settings → Pages → Source and select **GitHub Actions**.
