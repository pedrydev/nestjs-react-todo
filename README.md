# Todo Management App

Simple todo management app with a NestJS backend and a React frontend. One folder per project.

## Structure

```
.
├── backend/    NestJS 12 API (ESM, Vitest, oxlint)
├── frontend/   React 19 + Vite 8 + TypeScript
├── .nvmrc      Node 24 (LTS "Krypton")
```

## Requirements

- nvm
- Node 24 (`nvm use` at the repo root or inside either project)

## Getting started

```bash
nvm use

# backend
cd backend
npm install
npm run start:dev        # http://localhost:3000

# frontend
cd frontend
npm install
npm run dev              # http://localhost:5173
```

## Domain model

```
Todo {
  id:         string
  name:       string
  status:     "created" | "completed" | "deleted"
  responsible: string
}
```

## Scope

- Create a todo
- Change a todo status (`created` → `completed` → `deleted`)
- Filter todos by name, status, and responsible

## Scripts

| Project  | Command             | Description                  |
| -------- | ------------------- | ---------------------------- |
| backend  | `npm run start:dev` | Watch mode                   |
| backend  | `npm run build`     | Compile to `dist/`           |
| backend  | `npm test`          | Unit tests (Vitest)          |
| backend  | `npm run test:e2e`  | E2E tests                    |
| backend  | `npm run lint`      | Type-aware lint (oxlint)     |
| frontend | `npm run dev`       | Vite dev server              |
| frontend | `npm run build`     | Typecheck + production build |
| frontend | `npm run lint`      | oxlint                       |
