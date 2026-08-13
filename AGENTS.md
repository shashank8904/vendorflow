# VendorFlow — Agent Rules

This file is the primary instruction set for every AI agent working in this monorepo.
Read it fully before touching any code.

---

# Mandatory Agent Rules — Dexterous Technology

These rules apply to every agent working in this repository. They are mandatory unless the user explicitly overrides them for a specific task.

## Highest Priority

Plan first. No quick fix. Work as a single agent — do not use workers or sub-agents.

- Treat this as the most important repository instruction for every run.
- If any task request feels urgent, small, or obvious, still plan first before changing code.
- Do not bypass this workflow unless the user explicitly says to ignore these repo rules for that specific task.

## Read Memory First

Every session starts by reading repo memory before any planning or code work:

1. Read `.ai/decisions/` — browse topic folders relevant to the task and read the decision files inside. This is where the business "why" behind the codebase lives.
2. Read `.ai/sessions/` — find recent session files in topic folders relevant to the task. This is the AI work history: what was done before, what's unfinished, what was tried and rejected.
3. Only read what is relevant to the task. Do not load everything.

## No Workers or Sub-Agents

- Do not spin up worker agents, sub-agents, or parallel agent tasks for exploration, implementation, or review.
- All work — codebase exploration, planning, implementation, verification — is done directly by the single agent in the main session.
- This keeps the full context of the task in one place and every change reviewable in one thread.

## Agent Role

- The agent plans, brainstorms, coordinates with the user, implements, and reviews its own work.
- The agent must ask clarifying questions as needed. It should not rush from an unclear request into implementation.

## Planning and Approval Workflow

- Before implementation, the agent must discuss the approach with the user and produce a concrete plan.
- Implementation must not begin until the user approves the plan and explicitly asks the agent to proceed.
- After approval, the agent must break the plan into ordered subtasks before any code changes start.
- The agent must work through subtasks sequentially, completing and reviewing the current subtask before starting the next.

## Code Quality Rules

- Do not overcomplicate the codebase.
- Do not use quick fixes, hacks, or brittle patches.
- Do not optimize only for getting the latest bug fix or feature shipped.
- Every change must align with the existing architecture, style, naming, and patterns of the repository.
- Keep solutions clean, minimal, and maintainable.
- Avoid unnecessary abstractions, high-level design patterns, framework churn, or broad refactors.
- Prefer small, direct changes that reduce or preserve technical debt.
- Be careful about side effects and regression risk. Consider how a change interacts with nearby code and existing behavior.
- If the clean path is unclear, stop and ask questions during planning instead of guessing.

## Verification

- The agent must run the relevant checks (tests, type checks, lint, build) for each subtask when practical, and review the results before moving on.
- If checks cannot be run, the agent must report that clearly and explain the remaining risk.

## Memory Discipline

- `.ai/sessions/` — AI work history. One new file per local session, always. Never append to a previous session's file.
- `.ai/decisions/` — business decision history. High-level business decisions and project business logic only; the "why", never code detail.
- Both folders are organized as one level of topic folders with one file per session inside. Reuse an existing topic folder if one matches; only create a new one if nothing fits.
- Write the session file as you work and finalize it before the session ends. Record decisions the moment the user confirms them.
- Never hallucinate. If a fact is not in memory, in a plan, or in code, ask the user.

## Multi-Repo Projects

This repo may be one of several repos in a project (e.g. frontend, backend, super-admin frontend), checked out side by side under a root project directory. When the agent runs from that root:

- Each repo keeps its own `AGENTS.md`, `CLAUDE.md`, and `.ai/` memory.
- Session and decision files are written into the repo the work belongs to. Work spanning repos gets a session file in each affected repo.
- Never write memory files at the root level.

---

# Engineering Standards

Company-wide standards for the Dexterous stack: TypeScript everywhere, Node/Bun backend, React + Next.js frontend, PostgreSQL + Prisma, Zod for validation.

## API Contract Is the Single Source of Truth

Applies to every project with a frontend/backend split.

- The canonical contract lives in the frontend repo under `contract/`. The frontend side owns it and edits it first.
- The backend repo keeps a local mirror at `contract/`. It is byte-identical at each cutover, updated by hand-copying changed files from the frontend repo when implementing a contract change.
- Backend imports the contract via relative paths from its local mirror. No npm linking, no shared contract package wrapper. The contract folder has no `package.json`.
- Frontend reads the canonical folder via a path alias. Neither deploy needs the other repo at build time.
- Every API change starts by editing files under the frontend's `contract/` and appending an entry to the frontend's `contract/CHANGELOG.md` with status `needs-implementation`.
- The backend agent landing the implementation hand-copies the changed contract files, implements the change, and flips the entry to `done`.
- Backend Zod validation imports schemas exclusively from its local `contract/` mirror — never re-defines request/response schemas in route files.

> **Note:** No `contract/` folder exists yet in VendorFlow. If a contract layer is introduced, follow the pattern above.

## Code Organization

- No JSON-driven workflow engines or config-defined business flows. Ever.
- Business logic lives in plain TypeScript service files (`src/services/<feature>.service.ts`).
- Helpers live as named exports on a static-style namespace object, not class methods bound to `this`.
- Duplication > premature reuse in the first iteration. Refactor only when ≥3 call sites genuinely share behavior.
- No DI framework, no service container, no event bus. Plain imports.
- Files stay small. If a service file passes ~250 lines, split it.

## Persistence and Ops

- **Soft delete only.** Every collection/table has `deletedAt: DateTime | null`. Hard deletes require explicit user approval.
- **Multi-tenant:** every table carries the tenant key (`companyId`) and indexes lead with `(companyId, deletedAt, …)`.
- **Structured logging** — not yet wired in VendorFlow. Use `console.error` / `console.info` for now; wire structured logging before production.
- **Encryption at rest:** all third-party credentials and API keys stored in the database are AES-256-GCM encrypted. Never store secrets in plaintext.
- **Auth:** Firebase Auth on the client → custom JWT exchange on the backend. Not yet implemented in VendorFlow; planned.

---

# Project-Specific Rules — VendorFlow

These rules describe the exact technology choices, folder conventions, and patterns in this monorepo.

## Repository Layout

This is a **Turborepo monorepo** with two applications:

```
vendorflow/
  apps/
    api/          ← Express 5 + Bun backend  (see apps/api/AGENTS.md)
    web/          ← Next.js 16 + React 19 frontend  (see apps/web/AGENTS.md)
  packages/       ← (reserved; currently empty)
  AGENTS.md       ← this file (monorepo root — read first)
```

Each app has its own `AGENTS.md` with app-specific detail. Read the root file first, then the relevant app file.

Both apps are run independently. Never run commands from the monorepo root that affect both apps at once unless turbo is specifically required.

---

## Backend (`apps/api`)

### Runtime & Framework
- **Runtime:** Bun. Dev server: `bun --watch src/server.ts`. Never use `ts-node` or `tsx` to run the server.
- **Framework:** Express 5. Use the Express 5 API (async handler errors bubble automatically — no `next(err)` needed).
- **Language:** TypeScript everywhere. Bun runs TypeScript directly — no `tsc` build step.

### Database
- **Database:** PostgreSQL on **Neon** (serverless). Connection string in `DATABASE_URL` env var.
- **ORM:** Prisma 7 with `@prisma/adapter-pg`. The single Prisma client singleton lives at `src/lib/prisma.ts` — never instantiate `PrismaClient` elsewhere.
- **Schema:** `prisma/schema.prisma`. All schema changes go here first, then `prisma migrate dev` / `prisma generate`.
- **Soft delete:** Every user-data model must carry `deletedAt DateTime?`. Always filter `WHERE deletedAt IS NULL`.
- **Multi-tenancy:** Every data model carries `companyId String`. All queries filter by `companyId`.

### Domain Models (current schema)
| Model | Key fields |
|---|---|
| `Company` | Tenant root. `id`, `name`, `industry` |
| `User` | `companyId`, `email` (unique), `passwordHash`, `role` (ADMIN \| EMPLOYEE) |
| `Vendor` | `companyId`, `status` (ACTIVE \| INACTIVE) |
| `PurchaseOrder` | `companyId`, `vendorId`, `poNumber` (unique), `status` (PENDING \| CONFIRMED \| DELAYED \| CANCELLED) |
| `Call` | `purchaseOrderId`, `vendorId`, `status` (PENDING \| IN_PROGRESS \| COMPLETED \| FAILED), `transcript` |
| `CallResult` | 1-to-1 with `Call`. Structured outcome: `accepted`, `deliveryDate`, `quantity`, `delayReason`, `summary`, `confidence` |

### Folder Conventions (backend)
```
src/
  app.ts            ← Express app setup (middleware, route mounting)
  server.ts         ← HTTP server start
  lib/
    prisma.ts       ← Prisma singleton (only place PrismaClient is created)
  config/           ← Env config readers / validated config objects
  routes/           ← Route files: <feature>.routes.ts (thin: parse, validate, call service)
  controllers/      ← (reserved; currently empty — may be introduced later)
  services/         ← Business logic: <feature>.service.ts
  repositories/     ← DB access layer: <feature>.repository.ts (Prisma calls only)
  middlewares/      ← Express middleware
  models/           ← TypeScript types / interfaces mirroring DB models
  types/            ← Shared TS types not tied to a specific domain
  utils/            ← Pure utility functions
  validators/       ← Zod schemas for request validation
```

- **Validation:** All request body/query/param shapes are validated with **Zod** schemas in `src/validators/`. Never re-define shapes inline in route handlers.

---

## Frontend (`apps/web`)

### Framework & Language
- **Framework:** Next.js **16** (App Router). Canary/unreleased — read `node_modules/next/dist/docs/` before using any Next.js API.
- **React version:** React **19**. Follow React 19 semantics for hooks, server components, and actions.
- **Language:** TypeScript. All files `.tsx` / `.ts`. No `.js` / `.jsx`.

### Styling
- **CSS:** Tailwind CSS v4 (CSS-first config — **no `tailwind.config.js`**; config lives in `app/globals.css`).
- **Components:** shadcn/ui (v4) via `components.json`. Primitives in `components/ui/`. Never hand-edit — regenerate via `npx shadcn add`.
- **Animation:** `framer-motion` (v13). `tw-animate-css` for Tailwind utilities.
- **Icons:** `lucide-react`. **Charts:** `recharts`. **Toasts:** `sonner`. **Themes:** `next-themes`. **Class merging:** `cn()` from `lib/utils.ts` (`clsx` + `tailwind-merge`). **Command palette:** `cmdk`. **Headless primitives:** `@base-ui/react`.

### Folder Conventions (frontend)
```
app/
  (auth)/             ← Login / register pages
  (dashboard)/        ← Authenticated app shell
    vendors/
    purchase-orders/
    call-history/
    ai-calls/
    analytics/
    settings/
  globals.css         ← Global styles + Tailwind v4 config
components/
  ui/                 ← shadcn/ui primitives (do not hand-edit)
  layout/             ← Sidebar, topbar
  shared/             ← Cross-feature reusable components
  vendors/            ← Vendor-specific components
lib/
  utils.ts            ← cn() and pure utilities
  mock-data.ts        ← Temporary mock data (remove when real API is wired)
```

### Data & Auth
- Frontend currently uses **mock data** from `lib/mock-data.ts`. Wire real API calls when backend endpoints are ready.
- API base URL via `NEXT_PUBLIC_API_URL` env var — never hard-code `localhost`.
- Auth: not yet implemented. Firebase Auth → backend JWT exchange is planned.

---

## Development Workflow

| Task | Command | Directory |
|---|---|---|
| Start API | `bun run dev` | `apps/api` |
| Start frontend | `npm run dev` | `apps/web` |
| Prisma migrate | `npx prisma migrate dev` | `apps/api` |
| Prisma generate | `npx prisma generate` | `apps/api` |
| Add shadcn component | `npx shadcn add <component>` | `apps/web` |
