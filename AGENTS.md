# AGENTS.md

## Project

Simple todo management app. Backend in NestJS, frontend in React. One folder per project, no workspace root packages — each project installs and runs independently.

## Stack

- Node 24 (LTS "Krypton"), managed with nvm. `.nvmrc` at repo root and in each project. Run `nvm use` before installing or running anything.
- `backend/` — NestJS 12, ESM (`"type": "module"`), TypeScript 6, Vitest 4, oxlint (type-aware).
- `frontend/` — React 19, Vite 8, TypeScript 7, oxlint.
- Prefer latest stable language/framework features over legacy patterns. Do not introduce CommonJS.

## Layout

```
.
├── backend/
│   ├── src/
│   │   └── todos/          TodoStatus, DTOs, repository, service, controller
│   └── test/               e2e specs
├── frontend/
│   └── src/                API client, components, hooks
├── .nvmrc
└── README.md
```

## Domain model

```
Todo {
  id:          string
  name:        string
  status:      "created" | "completed" | "deleted"
  responsible: string
}
```

Invariants:

- `status` is one of `created`, `completed`, `deleted`. Treat it as an enum, not a free-form string.
- `name` and `responsible` are required and non-empty (trim before validating).
- Filtering by `name` and `responsible` is case-insensitive, partial match. Filtering by `status` is exact.
- Status changes go through the dedicated status endpoint; do not accept `status` in the create payload.

## API contract

- `POST /todos` — create a todo (`name`, `responsible`). Status starts as `created`.
- `PATCH /todos/:id/status` — change status (`status`).
- `GET /todos?name=&status=&responsible=` — list with optional filters.
- CORS enabled for the frontend dev origin.
- Return 400 on invalid input, 404 when a todo id does not exist.

## Persistence

Default: in-memory repository behind a `TodosRepository` interface, so a real database (SQLite/Prisma) can replace it without touching the service or controller. Do not couple domain code to the storage implementation.

## Commands

Run from the relevant project folder.

| Project  | Command                | Purpose                      |
| -------- | ---------------------- | ---------------------------- |
| backend  | `npm run start:dev`    | Watch mode on :3000          |
| backend  | `npm run build`        | Compile to `dist/`           |
| backend  | `npm test`             | Unit tests                   |
| backend  | `npm run test:e2e`     | E2E tests                    |
| backend  | `npm run lint`         | Type-aware lint              |
| frontend | `npm run dev`          | Vite dev server on :5173     |
| frontend | `npm run build`        | Typecheck + production build |
| frontend | `npm run lint`         | Lint                         |

## Verification

Before considering a task done, run the relevant project's lint and tests, plus `npm run build`. Both projects must stay green:
`backend`: `npm run lint && npm test && npm run test:e2e && npm run build`
`frontend`: `npm run lint && npm run build`

## Conventions

- Match existing code style; no comments unless the logic is non-obvious.
- Keep changes scoped to the requested task; do not refactor untouched code.
- Never commit secrets or `.env` files; `.env.example` may be committed.
- Do not commit unless explicitly asked.
