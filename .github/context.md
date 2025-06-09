# BookmarkScheduler – Project Source Directory Structure

This project is an Angular-based browser extension for managing and scheduling bookmarks. Below is the updated structure of the project, with brief descriptions for each main component and service.

## Top-Level Files

- `angular.json` – Angular workspace configuration
- `favicon.ico` – Project favicon
- `package.json` – Project dependencies and scripts
- `README.md` – Project documentation
- `tsconfig.app.json` – TypeScript configuration for the app
- `tsconfig.json` – Base TypeScript configuration
- `src/` – Application source code:
  - `index.html` – Main HTML entry point
  - `main.ts` – Angular application bootstrap
  - `manifest.json` – Browser extension manifest
  - `styles.sass` – Global styles
  - `browser/` – Background scripts for the extension

## Application Source (`src/app/`)

- `app.component.*` – Root Angular component (HTML, SCSS, TypeScript)
- `app.config.ts` – Application configuration

### Features

- `bookmarks-create/` – Components for creating new bookmarks
  - `bookmarks-create.component.ts` – Logic for bookmark creation
  - `bookmarks-create.component.html` – Template for creation UI
  - `bookmarks-create.component.scss` – Styles for creation UI
  - `bookmarks-create.model.ts` – Model for bookmark creation

- `bookmarks-list/` – Components for listing all bookmarks
  - `bookmarks-list.component.ts` – Logic for listing bookmarks
  - `bookmarks-list.component.html` – Template for list UI
  - `bookmarks-list.component.scss` – Styles for list UI

### Services

- `services/bookmarks-storage.service.ts` – Service for managing bookmark storage and persistence
- `services/chrome-tabs.service.ts` – Service for interacting with Chrome tabs API

### Utilities

- `utils/bookmarks-create.utils.ts` – Utility functions for bookmark creation
- `utils/bookmarks-list.utils.ts` – Utility functions for bookmark listing
- `utils/chrome-utils.ts` – Utility functions for Chrome integration
- `utils/date-utils.ts` – Utility functions for date handling
- `utils/tag-utils.ts` – Utility functions for tag management

---

This context should help contributors and AI tools quickly understand the project’s structure and the purpose of each main file and directory.
