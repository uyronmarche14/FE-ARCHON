# Archon Frontend

This workspace owns the Next.js App Router frontend for Archon.

It follows the canonical project docs in:

- `../docs/FRONTEND-PLAN.md`
- `../docs/STANDARDS.md`
- `../docs/CONTRACT-RULES.md`
- `../docs/UI-UX-MASTER.md`

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

## Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`

Additional templates:

- `.env.test.example`
- `.env.production.example`

Typical setup:

```bash
cp .env.example .env.local
```

## Current Scope

This scaffold currently includes:

- App Router route groups for public and app routes
- shared UI and app-shell placeholders
- SEO metadata, `robots.ts`, and `sitemap.ts`
- shared contracts, providers, and HTTP layer entry points

Feature implementation for auth, projects, and tasks should build on this
structure instead of replacing it.
