# BookmarkScheduler

BookmarkScheduler is an Angular-based browser extension for managing and scheduling bookmarks. It was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.9.

## Project Structure

- `angular.json` – Angular workspace configuration
- `package.json` – Project dependencies and scripts
- `src/` – Application source code
  - `app/` – Angular components and services
    - `bookmarks-create/` – Components for creating new bookmarks
    - `bookmarks-list/` – Components for listing bookmarks
    - `services/` – Services for storage, scheduling, and Chrome tabs API
    - `utils/` – Utility functions for bookmarks, dates, tags, and Chrome integration
  - `browser/` – Background scripts for browser extension functionality
  - `manifest.json` – Browser extension manifest
  - `styles.sass` – Global styles

## Available Scripts

In the project directory, you can run:

- `npm start` or `ng serve` – Runs the app in development mode
- `npm run build` or `ng build` – Builds the app for production
- `npm run watch` – Builds the app in watch mode for development

## Development Server

To start a local development server, run:

```bash
npm start
```

Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building and Packaging the Extension

To build the project for use as a browser extension:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory. To load the extension in your browser:

1. Open your browser's extensions page (e.g., `chrome://extensions/` for Chrome).
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `dist/` directory.
4. The extension will now be available in your browser.

## Usage

- Use the extension popup to create, view, and schedule bookmarks.
- Bookmarks can be managed and scheduled for later access.
- The extension uses background scripts for scheduling and Chrome Tabs API integration.

## Code Scaffolding

To generate a new component:

```bash
ng generate component component-name
```

For a complete list of available schematics:

```bash
ng generate --help
```

## Running Unit Tests

To execute unit tests with [Karma](https://karma-runner.github.io):

```bash
ng test
```

## Running End-to-End Tests

For end-to-end (e2e) testing:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Main Dependencies

- Angular 19
- Angular Material & CDK
- uuid
- rxjs
- zone.js

## Additional Resources

For more information on using the Angular CLI, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
