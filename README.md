# DOWINN Frontend

This package contains the Next.js frontend for DOWINN. It is the user-facing
application for authentication, project discovery, the project board
workspace, and the task collaboration drawer.

## Project Overview

The frontend is organized around four main product surfaces:

1. Public and auth flows: landing, signup, login, email verification, and
   invite entry
2. Projects dashboard: project discovery, creation, counts, and navigation
3. Project board workspace: the Kanban-style work area for a single project
4. Task collaboration detail: a task drawer with comments, attachments,
   subtasks, and audit history

Core responsibilities include:

- rendering public pages and protected app routes
- loading project and task data from the backend API
- managing board filters, sorting, and workspace interactions
- handling task create, edit, move, and detail review flows
- showing resilient loading, empty, and error states

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- TanStack Query
- Axios
- `@dnd-kit/core`
- Sonner
- Vitest and Testing Library

## Local Defaults

The checked-in `.env.example` uses these local defaults:

- app URL: `http://localhost:3000`
- backend API URL: `http://localhost:4000/api/v1`

Environment variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`

## Run Locally

From `frontend/`:

1. Copy the env file:

```bash
cp .env.example .env.local
```

2. Install dependencies:

```bash
pnpm install
```

3. Make sure the backend is running at `http://localhost:4000`
   or update `NEXT_PUBLIC_API_URL` to match your backend.

4. Start the frontend:

```bash
pnpm dev
```

5. Open `http://localhost:3000`

For the full reviewer flow, sign in at `http://localhost:3000/login` after the
backend seed flow has been run.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm test
pnpm typecheck
```

## Verification

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

## Known Issues / Incomplete Functionality

- There is no standalone mocked API mode in this package. The main reviewer
  flow depends on a running backend and seeded local data.
- Email verification and invite acceptance screens are implemented in the UI,
  but end-to-end email-driven testing depends on backend SMTP configuration.

## Related Notes

- [src/README.md](./src/README.md)
- [../README.md](../README.md)
