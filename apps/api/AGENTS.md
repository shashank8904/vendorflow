# Agent Rules — `apps/api` (VendorFlow Backend)

Read the monorepo root `AGENTS.md` first. This file adds backend-specific detail only.

---

## Stack Summary

| Concern | Choice |
|---|---|
| Runtime | **Bun** (`bun --watch src/server.ts`) |
| Framework | **Express 5** |
| Language | **TypeScript** (Bun runs directly — no build step) |
| Database | **PostgreSQL on Neon** (serverless) |
| ORM | **Prisma 7** + `@prisma/adapter-pg` |
| Validation | **Zod** (schemas in `src/validators/`) |
| Package manager | Bun |

---

## Key Files

| File | Purpose |
|---|---|
| `src/server.ts` | Starts the HTTP server |
| `src/app.ts` | Express app: middleware + route mounting |
| `src/lib/prisma.ts` | **Only** place `PrismaClient` is instantiated |
| `prisma/schema.prisma` | Database schema — edit here first |
| `prisma.config.ts` | Prisma CLI config (loads `.env`) |
| `.env` | Local env vars (`DATABASE_URL`, etc.) |

---

## Dev Commands (run from `apps/api/`)

```bash
bun run dev              # Start with hot reload
npx prisma migrate dev   # Create + apply a migration
npx prisma generate      # Regenerate Prisma client after schema change
npx prisma studio        # Open Prisma Studio GUI
```

---

## Backend Architecture Rules

### Routes are thin
Route handlers in `src/routes/<feature>.routes.ts` do exactly three things:
1. Parse and validate the request with a Zod schema from `src/validators/`.
2. Call a service function.
3. Return the response.

No business logic in route handlers. No Prisma calls in route handlers.

### Services own business logic
`src/services/<feature>.service.ts` — orchestrates the work.
- Calls repository functions for DB access.
- May call other services or utilities.
- Never imports from `routes/`.

### Repositories own DB access
`src/repositories/<feature>.repository.ts` — all Prisma calls live here.
- Imports `prisma` from `src/lib/prisma.ts`.
- Never contains business logic — only data access.
- Always filters by `companyId` and `deletedAt: null`.

### Validators define shapes
`src/validators/<feature>.validator.ts` — Zod schemas for all request inputs.
- One file per feature.
- Exported as named constants, e.g. `createVendorSchema`, `updateVendorSchema`.
- Route handlers import and call `.parse()` or `.safeParse()`.

---

## Prisma Rules

- **Never** call `new PrismaClient()` outside `src/lib/prisma.ts`.
- After editing `prisma/schema.prisma`, always run `prisma generate` before writing code that uses the new types.
- All queries on user-data models must include `where: { companyId, deletedAt: null }`.
- Soft delete = set `deletedAt: new Date()`. Never use Prisma's `delete()` on user-data models without explicit approval.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string (with `sslmode=require`) |

All env vars are loaded via `dotenv` at startup. Add new vars to `.env` (local) and document them here.

---

## Express 5 Notes

- Async route handlers throw errors directly — no need to wrap in try/catch and call `next(err)`. Express 5 catches async rejections automatically.
- Still use try/catch when you need to log or transform the error before responding.
- Use `res.json()` for all responses. Never `res.send()` for API responses.
