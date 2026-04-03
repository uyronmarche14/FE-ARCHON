<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend UI Rules

Use these rules whenever implementing, fixing, or refactoring UI in `frontend/`.
Apply them alongside `docs/UI-UX-MASTER.md`, not instead of it.

## Core UI Workflow

1. Inspect the current surface first: route, component tree, screenshots, and
   existing visual language.
2. Preserve flows, data contracts, and interaction meaning before changing
   styling or layout.
3. Define three things before touching structure:
   - visual thesis: one sentence describing the intended mood and hierarchy
   - content plan: hero/support/detail/final action for branded pages, or
     overview/work area/detail/action for app surfaces
   - interaction thesis: at most 2-3 purposeful motions or transitions
4. Build with real content, real labels, and resolved display values. Avoid raw
   ids, lorem ipsum, fake counts, and placeholder thinking.

## Authenticated App Surfaces

Default to calm, Linear-style restraint for dashboards, boards, settings, and
forms:

- strong typography and spacing before extra color
- few surfaces, few accent colors, clear hierarchy
- dense but readable information
- cards only when the card itself is the interaction
- badges should be compact, modern, and consistent
- headings, labels, numbers, and primary actions should explain the page even
  when scanned quickly

Avoid:

- card mosaics with every region boxed for no reason
- thick borders everywhere
- decorative gradients that compete with the content
- inconsistent spacing scales
- multiple competing accent colors
- raw UUIDs or backend-shaped values in the UI

## Branded And Marketing Pages

- treat the first viewport as one composition
- make the brand/product name hero-level on branded pages
- prefer full-bleed hero sections by default
- do not use cards in the hero unless the card is the primary interaction
- use at most two typefaces and one accent color
- give each section one job and one takeaway

## Interaction And Motion

- ship 2-3 intentional motions, not 10
- prefer one entrance rhythm, one sticky/scroll behavior, and one meaningful
  hover or layout transition
- remove decorative motion that does not improve hierarchy or feedback

## UI Quality Gate

Before handoff, check:

- alignment holds with uneven content lengths
- desktop, tablet, and mobile all stay readable
- empty, loading, and error states feel designed
- focus states and click targets are obvious
- the page still makes sense when scanning headings, labels, and numbers only

For substantial UI polish or inconsistency cleanup, prefer the repo-local
`ui-implementation` skill and the `ui_designer` Codex agent.
