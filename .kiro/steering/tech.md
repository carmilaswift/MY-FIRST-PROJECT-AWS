# Tech Stack

## Runtime & Package Manager

- **Bun** — runtime, bundler, package manager, and SQLite driver

## Backend

- **Elysia** — HTTP framework (with `@elysiajs/cors` and `@elysiajs/static`)
- **@sinclair/typebox** — request/response validation schemas (used via Elysia's `t` helper)
- **bun:sqlite** — embedded SQLite database (WAL mode enabled)

## Frontend

- **React 18** (single-page app, no router)
- **Tailwind CSS 3** — utility-first styling (dark theme)
- **Phosphor Icons** — icon set loaded via CDN (`@phosphor-icons/web`)
- Tailwind is loaded via CDN `<script>` tag in index.html; PostCSS/Tailwind config exists but is not currently used at build time

## Build

- `build.ts` — Bun bundler script that compiles `src/client/App.tsx` → `src/client/dist/assets/app.js` (minified, browser target)

## Code Formatting

- **Prettier** — semi, single quotes, trailing commas, 80 char width, 2-space indent

## Common Commands

| Task             | Command                |
| ---------------- | ---------------------- |
| Run dev server   | `bun run dev`          |
| Build frontend   | `bun run build.ts`     |
| Format code      | `bun run format`       |
| Check formatting | `bun run format:check` |

There is no test framework configured yet.
