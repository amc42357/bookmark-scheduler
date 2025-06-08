# Bookmark Scheduler – Project Source Directory Structure

This project is an Angular-based browser extension for managing and scheduling bookmarks. Below is the structure of the `src` directory, with brief descriptions for each main component and service.

## Top-Level Files

- `index.html` – Main HTML entry point.
- `main.ts` – Angular application bootstrap.
- `background.js` – Extension background script.
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

- `bookmarks-edit/` – Components for editing existing bookmarks.
  - `bookmarks-edit.component.ts` – Logic for editing bookmarks.
  - `bookmarks-edit.component.html` – Template for edit UI.
  - `bookmarks-edit.component.scss` – Styles for edit UI.

- `bookmarks-list/` – Components for listing all bookmarks.
  - `bookmarks-list.component.ts` – Logic for listing bookmarks.
  - `bookmarks-list.component.html` – Template for list UI.
  - `bookmarks-list.component.scss` – Styles for list UI.

- `bookmarks-remove/` – Components for removing bookmarks.
  - `bookmarks-remove.component.ts` – Logic for removing bookmarks.
  - `bookmarks-remove.component.html` – Template for remove UI.
  - `bookmarks-remove.component.scss` – Styles for remove UI.

### Services

- `services/bookmarks-storage.service.ts` – Service for managing bookmark storage and persistence.

---

This improved context should help contributors and AI tools quickly understand the project’s structure and the purpose of each main file and directory.
