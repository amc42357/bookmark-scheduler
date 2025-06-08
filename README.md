# BookmarkScheduler

This project is an Angular-based browser extension for managing and scheduling bookmarks. It was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.9.

## Project Structure

- `angular.json` – Angular workspace configuration
- `package.json` – Project dependencies and scripts
- `src/` – Application source code
  - `app/` – Angular components and services
    - `bookmarks-create/` – Components for creating new bookmarks
    - `bookmarks-list/` – Components for listing bookmarks
    - `services/` – Services for storage, scheduling, and Chrome tabs API
  - `manifest.json` – Browser extension manifest
  - `styles.sass` – Global styles

## Available Scripts

In the project directory, you can run:

- `npm start` or `ng serve` – Runs the app in development mode
- `npm run build` or `ng build` – Builds the app for production
- `npm run watch` – Builds the app in watch mode for development

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

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

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
