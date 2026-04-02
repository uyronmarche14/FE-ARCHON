# Archon Frontend

This workspace owns the Next.js frontend for Archon.

It is the user-facing application for authentication, project browsing, Kanban
task management, optimistic UI updates, and task log review.

Canonical product and delivery docs live in:

- `../README.md`
- `../docs/FRONTEND-PLAN.md`
- `../docs/UI-UX-MASTER.md`
- `../docs/API.md`
- `../docs/CONTRACT-RULES.md`
- `../docs/REVIEWER-PACK.md`

## What This Workspace Does

The frontend is responsible for:

- public login and signup flows
- protected app shell and session-aware routing
- projects dashboard loading, empty, retry, and error states
- project board rendering with grouped `TODO`, `IN_PROGRESS`, and `DONE` lanes
- task create, edit, delete, and detail review inside the task drawer
- drag-and-drop task status mutation with optimistic updates and rollback
- task activity log viewing inside the drawer
- query caching, mutation syncing, toast feedback, and route-level resilience

This app talks to the NestJS backend over the normalized `/api/v1` REST API and
renders the shipped assessment experience end to end.

## Tech Stack

Core framework and UI:

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui building blocks on top of Radix primitives
- Lucide icons

State and data flow:

- TanStack Query for server-state caching and invalidation
- Axios for typed HTTP access
- local component state for transient drawer and interaction state

Interaction and feedback:

- `@dnd-kit/core` for Kanban drag-and-drop
- Sonner for toast notifications

Quality and verification:

- ESLint
- Vitest
- Testing Library
- `tsc --noEmit` for typechecking

## Runtime Shape

The frontend follows a feature-oriented flow:

```text
App Route
-> feature component
-> feature hook
-> feature service
-> shared Axios client
-> backend /api/v1 endpoint
```

A typical board interaction looks like this:

```text
project board route
-> ProjectBoardShell
-> useProjectTasks / useUpdateTaskStatus / useCreateTask ...
-> tasks service functions
-> src/services/http client
-> backend tasks API
-> TanStack Query cache update + UI re-render
```

## Folder Scaffold

Top-level workspace files:

- `package.json`: frontend scripts and dependencies
- `.env.example`: local frontend env template
- `next.config.ts`: Next.js runtime config
- `components.json`: shadcn component registry config
- `public/`: static assets
- `src/`: application source

Important source folders:

```text
src/
|-- app/                Next.js App Router entrypoints and route boundaries
|-- components/
|   |-- shared/         app-shell and cross-feature UI
|   `-- ui/             reusable primitive components
|-- contracts/          frontend transport types aligned to backend API
|-- features/
|   |-- auth/           login, signup, auth-boundary behavior
|   |-- projects/       dashboard, project summaries, project services
|   `-- tasks/          board, drawer, DnD, logs, task mutations
|-- lib/                shared frontend utilities
|-- providers/          app-wide providers for query/toast/session plumbing
|-- services/
|   `-- http/           shared Axios client and HTTP helpers
|-- styles/             global styling layers
`-- test/               frontend test utilities and setup
```

Feature folders intentionally keep the same internal pattern where possible:

- `components/`: visible UI
- `hooks/`: query and mutation orchestration
- `services/`: API calls
- `lib/`: feature-specific helpers and data shaping

## Route Structure

The App Router is split into public and protected route groups:

- `src/app/(public)/`: unauthenticated pages such as login and signup
- `src/app/(app)/app/`: authenticated workspace shell and app pages

Key shipped routes:

- `/login`
- `/signup`
- `/app`
- `/app/projects/[projectId]`

The protected group includes route-level `loading.tsx` and `error.tsx`
boundaries so the app shell stays resilient during loading and runtime failures.

## Main Implemented Surfaces

### Auth

- login and signup forms
- session bootstrap with current-user loading
- redirect-safe protected routing

### Projects Dashboard

- project cards, counts, and summaries
- loading skeletons, retry actions, and empty guidance
- create-project flow with feedback

### Task Board

- three-lane grouped board
- responsive layout for desktop and mobile
- optimistic status drag-and-drop
- rollback on failed status mutation

### Task Drawer

- view mode for task details and logs
- create and edit flows
- inline destructive confirmation for delete
- member picker and due-date support

### Task Logs

- newest-first timeline
- loading, empty, retry, and error rendering
- readable value formatting for field-level audit events

## Environment

Copy the local example:

```bash
cp .env.example .env.local
```

Typical local values:

- `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`

The frontend expects the backend to be reachable locally on port `4000` unless
you intentionally override that value.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm test
pnpm typecheck
```

## Local Reviewer Flow

For the fastest reviewer path:

1. Start the backend locally on `http://localhost:4000`.
2. Seed demo data with `POST /api/v1/seed/init`.
3. Start the frontend.
4. Open `http://localhost:3000/login`.
5. Sign in with `demo.member@example.com` / `DemoPass123!`.

Primary review journey:

1. land on the dashboard
2. open the seeded project board
3. drag a card across lanes
4. open a task drawer
5. inspect logs
6. create, edit, and delete a task

See `../docs/REVIEWER-PACK.md` for the repo-wide walkthrough.

## Verification

Use these before handoff:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

For repo-wide verification, run:

```bash
bash ../scripts/quality-gate.sh
```
