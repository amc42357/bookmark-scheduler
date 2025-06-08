# Bookmark Scheduler – Project Source Directory Structure

This project is an Angular-based browser extension for managing and scheduling bookmarks. Below is the structure of the project, with brief descriptions for each main component and service.

## Top-Level Files

- `angular.json` – Angular workspace configuration.
- `favicon.ico` – Project favicon.
- `package.json` – Project dependencies and scripts.
- `README.md` – Project documentation.
- `tsconfig.app.json` – TypeScript configuration for the app.
- `tsconfig.json` – Base TypeScript configuration.
- `public/` – Static assets (e.g., `favicon.ico`).
- `src/` – Application source code:
  - `index.html` – Main HTML entry point.
  - `main.ts` – Angular application bootstrap.
  - `manifest.json` – Browser extension manifest.
  - `styles.sass` – Global styles.

## Application Source (`src/app/`)

- `app.component.*` – Root Angular component (HTML, SCSS, TypeScript).
- `app.config.ts` – Application configuration.

### Features

- `bookmarks-create/` – Components for creating new bookmarks.
  - `bookmarks-create.component.ts` – Logic for bookmark creation.
  - `bookmarks-create.component.html` – Template for creation UI.
  - `bookmarks-create.component.scss` – Styles for creation UI.

- `bookmarks-list/` – Components for listing all bookmarks.
  - `bookmarks-list.component.ts` – Logic for listing bookmarks.
  - `bookmarks-list.component.html` – Template for list UI.
  - `bookmarks-list.component.scss` – Styles for list UI.

### Services

- `services/bookmarks-storage.service.ts` – Service for managing bookmark storage and persistence.
- `services/bookmark-scheduler.service.ts` – Service for scheduling bookmark-related actions.
- `services/chrome-tabs.service.ts` – Service for interacting with Chrome tabs API.

---

This improved context should help contributors and AI tools quickly understand the project’s structure and the purpose of each main file and directory.
