# Archon Frontend

This workspace owns the Next.js frontend for Archon. It is the user-facing
application layer for authentication, project discovery, the project board
workspace, and the richer task collaboration drawer.

Canonical docs live in:

- `../README.md`
- `../docs/ARCHITECTURE.md`
- `../docs/FRONTEND-PLAN.md`
- `../docs/API.md`
- `../docs/REVIEWER-PACK.md`

## What This Workspace Owns

The frontend is organized around four shipped surfaces:

1. Public and auth
2. Projects dashboard
3. Project board workspace
4. Task collaboration detail

Responsibilities include:

- public landing, login, signup, verification, and invite entry flows
- protected app shell and session-aware routing
- projects dashboard loading, empty, retry, and error states
- project board workspace orchestration, including tabs, filters, metrics, and
  activity composition
- task create, edit, delete, move, and detail review inside the task drawer
- comments, attachments, subtasks, checklist, and audit-history rendering
- query caching, mutation syncing, toast feedback, and route-level resilience

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui on top of Radix primitives
- TanStack Query
- Axios
- `@dnd-kit/core`
- Sonner
- Vitest and Testing Library

## Runtime Flow

```text
App Route
-> feature component
-> feature hook
-> feature service
-> shared Axios client
-> backend /api/v1 endpoint
```

The most important page, `/app/projects/[projectId]`, is intentionally a
composed workspace:

- `projects` provides project identity, members, invites, statuses, and project
  activity
- `tasks` provides reusable task-domain UI and task operations
- `project-board` composes both into the main workspace surface

## Folder Scaffold

```text
src/
|-- app/                Next.js route entrypoints and route boundaries
|-- components/
|   |-- shared/         cross-feature shell primitives
|   `-- ui/             reusable UI primitives
|-- contracts/          frontend transport types and shared workflow primitives
|-- features/
|   |-- auth/           login, signup, verification, invite entry
|   |-- project-board/  board workspace orchestration and workspace helpers
|   |-- projects/       dashboard, invites, status management, project queries
|   |-- public/         marketing and public-page presentation
|   `-- tasks/          task drawer, form, card, comments, attachments, logs
|-- lib/                shared utilities
|-- providers/          app-wide query/toast/session providers
|-- services/http/      shared Axios client and HTTP helpers
`-- test/               frontend test setup
```

Feature folders follow the same internal pattern where possible:

- `components/`: visible UI
- `hooks/`: query and mutation orchestration
- `services/`: API calls
- `lib/`: feature-specific helpers

## Route Structure

Implemented routes:

- `/`
- `/login`
- `/signup`
- `/verify-email`
- `/invite/[token]`
- `/app`
- `/app/projects/[projectId]`

The protected app route group includes route-level `loading.tsx` and `error.tsx`
boundaries so the app shell stays resilient during loading and runtime
failures.

## Main Feature Slices

### `features/auth`

- login and signup forms
- verification-pending signup UX
- verification resend/confirm flows
- invite-entry routing helpers

### `features/projects`

- projects dashboard
- create-project flow
- project invite actions
- project status management dialogs and services
- project-domain hooks such as member loading

### `features/project-board`

- `ProjectBoardShell`
- board-level tabs, filters, metrics, and activity feed composition
- workspace-only helpers for lanes, filters, and project-summary sync

### `features/tasks`

- task card, drawer, and form
- task comments, attachments, subtasks, and logs panels
- task create/update/delete/status services and hooks
- reusable task formatting and status presentation helpers

## Contracts

Transport contracts live in `src/contracts/`:

- `api.ts`: envelopes and shared API primitives
- `auth.ts`: auth, verification, and invite transport types
- `projects.ts`: project, member, invite, and activity transport types
- `tasks.ts`: task, comment, attachment, log, and task-detail transport types
- `workflow.ts`: shared workflow primitives such as status colors and task-log
  value types

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

1. Start the backend on `http://localhost:4000`.
2. Seed demo data with `POST /api/v1/seed/init`.
3. Start the frontend.
4. Open `http://localhost:3000/login`.
5. Sign in with `demo.member@example.com` / `DemoPass123!`.
6. Navigate dashboard -> project board workspace -> task drawer.

## Verification

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

For repo-wide verification:

```bash
bash ../scripts/quality-gate.sh
```
