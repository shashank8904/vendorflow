<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Project-Specific Rules — VendorFlow

These rules describe the exact technology choices, folder conventions, and patterns in this repository. They extend and refine the mandatory agent rules and company-wide engineering standards above.

## Repository Layout

This is a **Turborepo monorepo** with two applications:

```
vendorflow/
  apps/
    api/          ← Express 5 + Bun backend
    web/          ← Next.js 16 + React 19 frontend
  packages/       ← (reserved; currently empty)
```

Both apps are run independently (`bun run dev` in `apps/api`, `npm run dev` in `apps/web`). Never run commands from the monorepo root that affect both apps at once unless turbo is specifically required.

---

## Backend (`apps/api`)

### Runtime & Framework
- **Runtime:** Bun. Dev server: `bun --watch src/server.ts`. Never use `ts-node` or `tsx` to run the server.
- **Framework:** Express 5. Use the Express 5 API (async handler errors bubble automatically — no `next(err)` needed). Import types from `@types/express`.
- **Language:** TypeScript everywhere. `tsconfig.json` governs compilation; no `tsc` build step is used — Bun runs TypeScript directly.

### Database
- **Database:** PostgreSQL on **Neon** (serverless). Connection string is always in `DATABASE_URL` env var.
- **ORM:** Prisma 7 with `@prisma/adapter-pg` (connection-pool adapter). The single Prisma client singleton lives at `src/lib/prisma.ts` and **must** be imported from there — never instantiate `PrismaClient` elsewhere.
- **Schema:** `prisma/schema.prisma`. All schema changes go here first, then `prisma migrate dev` / `prisma generate`.
- **Soft delete:** Every model that represents user data must carry `deletedAt DateTime?`. Filter `WHERE deletedAt IS NULL` in all queries. Hard deletes require explicit user approval.
- **Multi-tenancy:** Every data model carries `companyId String` as the tenant key. All queries must filter by `companyId`. Prisma index order: `(companyId, deletedAt, …)`.

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

- **Validation:** All request body/query/param shapes are validated with **Zod** schemas defined in `src/validators/`. Route handlers import and call `.parse()` / `.safeParse()` — never re-define shapes inline.
- **No contract folder exists yet** in this project. If a contract layer is introduced, follow the company-wide API Contract rule.

---

## Frontend (`apps/web`)

### Framework & Language
- **Framework:** Next.js **16** (App Router). This is a canary/unreleased version — always read `node_modules/next/dist/docs/` before using any Next.js API; do not assume parity with Next.js 13/14/15 docs.
- **React version:** React **19** (stable). Hooks, server components, and actions follow React 19 semantics.
- **Language:** TypeScript. All files are `.tsx` / `.ts`. No `.js` / `.jsx` files.

### Styling
- **CSS framework:** **Tailwind CSS v4** (PostCSS plugin; `@tailwindcss/postcss`). Tailwind v4 uses a CSS-first config — there is **no `tailwind.config.js`**; configuration lives in `app/globals.css`.
- **Component library:** **shadcn/ui** (v4) configured via `components.json`. All generated UI primitives live in `components/ui/`. Never hand-edit files in `components/ui/` — regenerate via `npx shadcn add`.
- **Animation:** `framer-motion` (v13) for page/section animations. `tw-animate-css` for Tailwind utility animations.
- **Icons:** `lucide-react`.
- **Charts:** `recharts`.
- **Toasts:** `sonner`.
- **Themes:** `next-themes` (light/dark toggle).
- **Class merging:** `clsx` + `tailwind-merge` (`cn()` helper in `lib/utils.ts`).
- **Command palette:** `cmdk`.
- **Base UI primitives:** `@base-ui/react` for accessible headless components.

### Folder Conventions (frontend)
```
app/
  layout.tsx          ← Root layout (fonts, providers, global CSS)
  page.tsx            ← Root redirect / landing
  (auth)/             ← Auth route group (login, register, etc.)
  (dashboard)/        ← Authenticated app route group
    layout.tsx        ← Dashboard shell (sidebar, nav)
    page.tsx          ← Dashboard home
    vendors/          ← Vendor management pages
    purchase-orders/  ← PO management pages
    call-history/     ← Call log pages
    ai-calls/         ← AI-driven call pages
    analytics/        ← Analytics pages
    settings/         ← Settings pages
  globals.css         ← Global styles + Tailwind v4 config
components/
  ui/                 ← shadcn/ui primitives (auto-generated; do not hand-edit)
  layout/             ← App shell components (sidebar, topbar)
  shared/             ← Cross-feature reusable components (PageHeader, StatusBadge, etc.)
  vendors/            ← Vendor-specific components
lib/
  utils.ts            ← cn() helper and other pure utilities
  mock-data.ts        ← Mock/seed data for UI development (remove when real API is wired)
```

### Data Fetching
- Currently the frontend uses **mock data** from `lib/mock-data.ts`. Real API calls will be wired when backend endpoints are ready.
- When integrating real API calls, use `fetch` with `async` Server Components where possible. Use client components (`"use client"`) only when interactivity requires it.
- API base URL comes from an env var (e.g. `NEXT_PUBLIC_API_URL`). Never hard-code `localhost` URLs.

### Component Rules
- All new page-level components go in the appropriate `(dashboard)/<feature>/page.tsx`.
- Shared components used in two or more features belong in `components/shared/`.
- Feature-specific components belong in `components/<feature>/`.
- Keep `"use client"` boundary as deep as possible — prefer Server Components at the page level.

---

## Development Workflow

| Task | Command | Directory |
|---|---|---|
| Start API | `bun run dev` | `apps/api` |
| Start frontend | `npm run dev` | `apps/web` |
| Prisma migrate | `npx prisma migrate dev` | `apps/api` |
| Prisma generate | `npx prisma generate` | `apps/api` |
| Add shadcn component | `npx shadcn add <component>` | `apps/web` |

- **No build step for the API** — Bun runs TypeScript directly.
- **No Zod in the frontend yet** — add it if form validation is needed.
- **No auth implemented yet** — Firebase Auth integration is planned per company standards but not yet in place.
- **No logging library yet** — use `console.error` / `console.info` for now; structured logging (per company standard) should be wired before production.
