# Repository Guidelines

## Project Structure & Module Organization
- `server.js`: Express app entry; wires routes, views, static assets, MongoDB.
- `routes/`: Express routers (e.g., `routes/articles.js`).
- `models/`: Mongoose schemas (`models/article.js`, `models/mail.js`).
- `views/`: EJS templates (`views/index.ejs`, `views/articles/*.ejs`).
- `public/`: Static assets (CSS, images) served at `/public`.
- `Procfile`: Heroku process definition; uses `nodemon` for local Procfile runs.

## Build, Test, and Development Commands
- Install: `npm install`
- Start (prod-like): `npm start` (runs `node server.js`).
- Dev (auto-reload): `npx nodemon server.js` or `heroku local web` (uses `Procfile`).
- Environment: create `.env` with `URI=<mongodb-connection-string>` and optional `PORT=3000`.

## Coding Style & Naming Conventions
- JavaScript: 2-space indentation, single quotes, no semicolons (match current files).
- Naming: camelCase for variables/functions; PascalCase for Mongoose models (`Article`, `Email`).
- Files: keep EJS template names lowercase/camelCase consistent with existing (`aboutUs.ejs`, `articles/show.ejs`); CSS/images kebab-case in `public/assets/`.
- Routes: use `express.Router()` and export the router from files in `routes/`.

## Testing Guidelines
- No test framework configured yet. If adding tests, prefer Jest + Supertest.
- Place tests under `__tests__/` mirroring source paths (e.g., `__tests__/routes/articles.test.js`).
- Target: meaningful coverage of routing, model hooks, and rendering. Run with `npm test` once configured.

## Commit & Pull Request Guidelines
- Commit messages: follow Conventional Commits style observed in history (`fix:`, `feat:`, `add:`, `remove:`, `change:`). Example: `feat: add slug validation to Article`.
- PRs should include: clear description, linked issue (if any), steps to run locally, and screenshots for UI changes.
- Keep diffs focused; update EJS, routes, and models in separate commits when possible.

## Security & Configuration Tips
- Do not commit secrets; `.env` is already ignored. Use `dotenv` via `server.js`.
- User content is sanitized via DOMPurify; do not bypass `sanitizedHtml` in views.
- Use a non-production MongoDB for local work; confirm `URI` before running destructive actions.
