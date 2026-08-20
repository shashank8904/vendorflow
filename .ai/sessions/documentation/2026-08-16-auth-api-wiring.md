# Session: Firebase Auth + API Wiring

**Date:** 2026-08-16  
**Task:** Complete Firebase auth integration and replace all mock data; complete all current features.

## What Was Done

### Discovery
- The Firebase auth was already 100% implemented: `lib/firebase.ts`, `lib/auth-context.tsx` (email/password, Google OAuth, sign-up, password reset, demo login), login page, and `AuthGuard` component.
- The `lib/api.ts` API client was already fully built with namespaces for vendors, purchase-orders, dashboard, analytics, notifications.
- Dashboard, Vendors, POs, Analytics, Notifications — already wired to real API.
- Only 3 pages still used `MOCK_AI_CALLS`: `ai-calls/page.tsx`, `call-history/page.tsx`, `ai-calls/[id]/page.tsx`.
- The settings page was already a rich 336-line UI stub but not wired to `useAuth`.
- `GET /api/v1/calls` endpoint did not exist.

### Backend Changes
Created the complete `/api/v1/calls` endpoint stack:
- `src/validators/call.validator.ts` — Zod query schema (page, limit, sort, order, status, purchaseOrderId, vendorId)
- `src/repositories/call.repository.ts` — company-scoped via `purchaseOrder.companyId` (Call model has no direct companyId)
- `src/services/call.service.ts` — pagination + getById
- `src/controllers/call.controller.ts` — thin handler matching existing pattern
- `src/routes/call.routes.ts` — GET / and GET /:id
- `src/app.ts` — mounted at `/api/v1/calls`

### Frontend Changes
- `lib/api.ts` — Extended `CallItem` type with `purchaseOrder` + `vendor` relations; added `callsApi` namespace.
- `ai-calls/page.tsx` — Full rewrite from mock to real API. Live pagination, status filter, search. Empty state for no calls. "Start Call" button shows CALL-E coming-soon toast.
- `call-history/page.tsx` — Full rewrite from mock to real API. Stats derived from fetched page. Load-more pagination.
- `ai-calls/[id]/page.tsx` — Full rewrite from mock to real API. Fetches call by ID, renders stored transcript as pre-formatted block, displays CallResult. Redirects to /ai-calls if not found.
- `settings/page.tsx` — Added "My Profile" tab as the default active tab. Wired to `useAuth()` — shows avatar, name, email, Firebase UID, auth method. Real sign-out button. API connection status card pinging `/health`.

### Verification
- `bun run --bun tsc --noEmit` in `apps/api` → exit 0
- `npx tsc --noEmit` in `apps/web` → exit 0
- `grep MOCK_AI_CALLS apps/web/app/**/*.tsx` → no results

## Key Decisions
- Company ID stays as `NEXT_PUBLIC_COMPANY_ID` hardcoded env var for now; Firebase → JWT → companyId exchange is a future task.
- Call detail page uses `transcript` field (plain text/JSON string) from DB, rendered as pre-formatted block instead of the complex mock turn-by-turn UI (which relied on mock-only structured transcript arrays that don't exist in the DB schema).
- `Textarea` import removed from settings page in favour of no-textarea use in the profile section (existing sections keep it).
