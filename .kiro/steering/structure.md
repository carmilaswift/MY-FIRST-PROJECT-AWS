# Project Structure

```
.
├── src/
│   ├── client/               # Frontend (React SPA)
│   │   ├── App.tsx           # Entire React app (single-file, all components)
│   │   ├── index.html        # HTML shell served at /
│   │   └── dist/assets/      # Build output (app.js) — git-ignored
│   └── server/               # Backend (Elysia)
│       ├── index.ts          # Server entry point, static file serving
│       ├── routes.ts         # All API route definitions (/api/*)
│       └── db.ts             # SQLite setup, schema, seed data
├── build.ts                  # Frontend build script (Bun bundler)
├── kanban.db                 # SQLite database file (auto-created)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── .prettierrc
```

## Architecture Notes

- **Monorepo-style single package** — client and server live in the same project with no separate build pipelines beyond `build.ts`.
- **Server serves the client** — Elysia handles `/` (index.html) and `/assets/*` (bundled JS) directly; no separate static hosting.
- **API prefix** — all backend endpoints live under `/api` (tasks CRUD, comments, categories, priorities).
- **Single-file frontend** — all React components are in `App.tsx`. If the app grows, split into `src/client/components/`.
- **Database** — SQLite file at project root (`kanban.db`). Schema and seeds are applied on server start via `db.ts`.
