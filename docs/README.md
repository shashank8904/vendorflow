# VendorFlow — Complete Project Documentation

> Living technical reference for the VendorFlow monorepo.  
> Last updated: August 2026

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [System Design](#2-system-design)
3. [Database Schema](#3-database-schema)
4. [API Reference](#4-api-reference)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Current Gaps](#6-current-gaps)
7. [Future Feature Modules](#7-future-feature-modules)

---

# 1. Product Overview

## What is VendorFlow?

VendorFlow is a **B2B procurement operations platform** that helps manufacturing and trading companies manage their vendor relationships and purchase orders — and, critically, automate the follow-up calls to vendors through an AI voice agent called **CALL-E**.

The core insight is that procurement teams waste enormous time calling vendors to confirm order status, chase delayed deliveries, and extract structured data from phone conversations. VendorFlow replaces this manual work with an AI agent that:

1. Places outbound calls to vendors on behalf of the company.
2. Conducts natural, structured conversations to confirm delivery status, detect delays, and extract key information.
3. Auto-updates the purchase order lifecycle and surfaces alerts/insights to the procurement team.

## Target User

**Procurement managers and teams** at Indian SMBs and mid-market manufacturing, distribution, or trading companies. The primary market context is reflected in the mock data (GST numbers, INR amounts, Indian vendor addresses, regional phone formats).

## Core Workflows

| Workflow | Status |
|---|---|
| Vendor CRUD management | ✅ Backend + Frontend (mock data) |
| Purchase Order lifecycle management | ✅ Backend + Frontend (mock data) |
| AI Call scheduling and transcript viewing | 🟡 Frontend mock only — no real AI integration |
| Dashboard summary and metrics | ✅ Backend + Frontend (mock data) |
| Analytics (monthly trends, delays, vendor performance) | ✅ Backend + Frontend (mock data) |
| Notifications (system and per-user) | ✅ Backend; Frontend not yet wired |
| Audit logging | ✅ Backend write path; Frontend not yet wired |
| Authentication (Firebase → JWT) | ❌ Not implemented |
| Multi-tenant company onboarding | ❌ Not implemented |

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 (CSS-first), shadcn/ui v4 |
| Backend | Express 5, Bun runtime, TypeScript |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Database | PostgreSQL on Neon (serverless) |
| Logging | Pino (`src/lib/logger.ts`) |
| Validation | Zod v4 (backend only) |
| Animation | Framer Motion v13, tw-animate-css |
| Charts | Recharts |
| Monorepo | Turborepo |

---

# 2. System Design

## 2.1 Monorepo Layout

```
vendorflow/
├── apps/
│   ├── api/          ← Express 5 + Bun backend
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── app.ts          ← Express app (middleware + routes)
│   │       ├── server.ts       ← HTTP server start + graceful shutdown
│   │       ├── config/         ← Env config
│   │       ├── constants/      ← App-wide constants (rate limits, audit actions)
│   │       ├── controllers/    ← Request handlers (thin wrappers)
│   │       ├── errors/         ← Custom error classes
│   │       ├── lib/
│   │       │   ├── prisma.ts   ← Singleton Prisma client
│   │       │   └── logger.ts   ← Pino logger singleton
│   │       ├── middlewares/    ← Express middleware
│   │       ├── models/         ← TypeScript interfaces mirroring DB
│   │       ├── repositories/   ← Prisma data access layer
│   │       ├── routes/         ← Route definitions
│   │       ├── services/       ← Business logic
│   │       ├── types/          ← Shared TS types
│   │       ├── utils/          ← Pure utilities (pagination, response builder)
│   │       └── validators/     ← Zod schemas for request validation
│   └── web/          ← Next.js 16 frontend
│       ├── app/
│       │   ├── (auth)/         ← Login / register pages
│       │   ├── (dashboard)/    ← Protected app shell
│       │   │   ├── vendors/
│       │   │   ├── purchase-orders/
│       │   │   ├── call-history/
│       │   │   ├── ai-calls/
│       │   │   ├── analytics/
│       │   │   └── settings/
│       │   ├── globals.css     ← Global styles + Tailwind v4 config
│       │   └── layout.tsx      ← Root layout
│       ├── components/
│       │   ├── ui/             ← shadcn/ui primitives (auto-generated)
│       │   ├── layout/         ← Sidebar, topbar
│       │   ├── shared/         ← Cross-feature components
│       │   └── vendors/        ← Vendor-specific components
│       └── lib/
│           ├── utils.ts        ← cn() helper
│           └── mock-data.ts    ← Temporary mock data
└── packages/         ← Reserved (currently empty)
```

## 2.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser / Client                  │
│              Next.js 16  (React 19, TypeScript)          │
└────────────────────────┬────────────────────────────────┘
                         │  HTTPS  (NEXT_PUBLIC_API_URL)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  VendorFlow API (Bun + Express 5)        │
│                                                          │
│   helmet  ─  cors  ─  express.json  ─  requestLogger   │
│   apiRateLimiter  ─  companyContext middleware            │
│                                                          │
│   /api/v1/health           (public)                      │
│   /api/v1/vendors          (company-scoped)              │
│   /api/v1/purchase-orders  (company-scoped)              │
│   /api/v1/dashboard        (company-scoped)              │
│   /api/v1/analytics        (company-scoped)              │
│   /api/v1/notifications    (company-scoped)              │
│   /api/v1/audit-logs       (company-scoped)              │
└────────────────────────┬────────────────────────────────┘
                         │  Prisma 7 + pg adapter
                         ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL on Neon (serverless)              │
│   Company · User · Vendor · PurchaseOrder                │
│   Call · CallResult · Notification · AuditLog            │
└─────────────────────────────────────────────────────────┘
                                        ┐
                                        │  (planned)
                         ┌──────────────▼──────────────┐
                         │       CALL-E AI Agent         │
                         │  (voice AI — not yet wired)   │
                         └─────────────────────────────┘
```

## 2.3 Request Lifecycle

A typical authenticated API request flows through these layers in order:

```
HTTP Request
    │
    ▼  helmet (security headers)
    │
    ▼  cors (CORS headers)
    │
    ▼  express.json (body parsing, 10 MB limit)
    │
    ▼  requestLogger (Pino HTTP — structured logging)
    │
    ▼  apiRateLimiter (100 req / 15 min per IP)
    │
    ▼  companyContext middleware
    │     → reads X-Company-Id header
    │     → attaches req.companyId
    │     → rejects with 400 if missing
    │
    ▼  Route handler (validate middleware)
    │     → Zod schema validation (body / query / params)
    │     → rejects with 422 if invalid
    │
    ▼  Controller (thin)
    │     → calls service function
    │     → wraps result in ApiResponseBuilder
    │
    ▼  Service
    │     → business logic
    │     → calls repository functions
    │     → fire-and-forget audit log
    │
    ▼  Repository
    │     → Prisma queries (always scoped: companyId + deletedAt: null)
    │
    ▼  HTTP Response (JSON)
```

### Error Handling

Express 5 automatically catches async errors thrown in route handlers. The `globalErrorHandler` middleware maps error types to HTTP status codes:

| Error Class | HTTP Status |
|---|---|
| `NotFoundError` | 404 |
| `ValidationError` | 422 |
| `ConflictError` | 409 |
| Zod `ZodError` | 400 |
| All others | 500 |

## 2.4 Multi-Tenancy Model

Every data table carries a `companyId` column. All queries are scoped:

```typescript
// Every repository method always includes:
where: { companyId, deletedAt: null }
```

The `companyContext` middleware injects `companyId` from the `X-Company-Id` request header into `req.companyId`. This is a **development-time placeholder** — in production this will be replaced by a JWT extraction middleware.

## 2.5 Soft Delete Pattern

No user-data model is ever hard-deleted. Deletion sets `deletedAt = new Date()`. All queries filter `WHERE deletedAt IS NULL`. This is enforced at the repository layer.

## 2.6 Rate Limiting

| Limiter | Limit | Applied to |
|---|---|---|
| `apiRateLimiter` | 100 req / 15 min / IP | All routes |
| `mutationRateLimiter` | 20 req / 15 min / IP | Mutation endpoints (defined but not globally applied yet) |

## 2.7 Logging

Pino is wired in both `src/lib/logger.ts` (application logger) and `pino-http` (HTTP request logger via `requestLogger` middleware). Log level, pretty-printing in dev vs. JSON in prod, are configured from env.

## 2.8 Purchase Order Status Machine

```
             ┌──────────┐
             │  PENDING  │ ◄─────────────────────┐
             └────┬──────┘                       │
                  │                              │
         CONFIRMED│                         (future)
                  ▼
             ┌──────────┐
             │ CONFIRMED │
             └────┬──────┘
                  │
          DELAYED │
                  ▼
             ┌──────────┐
             │  DELAYED  │ ──CONFIRMED──► CONFIRMED
             └────┬──────┘
                  │
       CANCELLED  │
                  ▼
             ┌──────────┐
             │ CANCELLED │  (terminal)
             └──────────┘
```

Valid transitions are enforced in `purchaseOrderService.updatePurchaseOrderStatus()`:

| From | Allowed To |
|---|---|
| PENDING | CONFIRMED, CANCELLED |
| CONFIRMED | DELAYED, CANCELLED |
| DELAYED | CONFIRMED, CANCELLED |
| CANCELLED | (none — terminal) |

---

# 3. Database Schema

## 3.1 Entity Overview

| Model | Purpose | Soft Delete |
|---|---|---|
| `Company` | Tenant root — one row per customer company | ❌ |
| `User` | Employees/admins of a company | ❌ |
| `Vendor` | Suppliers managed by the company | ✅ `deletedAt` |
| `PurchaseOrder` | Purchase orders raised against vendors | ✅ `deletedAt` |
| `Call` | AI phone calls placed for a PO | ❌ |
| `CallResult` | Structured outcome of a call (1:1 with Call) | ❌ |
| `Notification` | In-app notifications (company or user-scoped) | ✅ `deletedAt` |
| `AuditLog` | Immutable audit trail of all mutations | ❌ (never deleted) |

## 3.2 Model Definitions

### Company

```sql
Company {
  id        String   -- cuid, PK
  name      String
  industry  String?
  createdAt DateTime
  updatedAt DateTime
}
```

Tenant root. Every other entity links back here via `companyId`.

---

### User

```sql
User {
  id           String   -- cuid, PK
  companyId    String   -- FK → Company.id
  name         String
  email        String   -- UNIQUE globally
  passwordHash String
  role         UserRole -- ADMIN | EMPLOYEE (default: EMPLOYEE)
  createdAt    DateTime
  updatedAt    DateTime
}

INDEX: (companyId)
```

---

### Vendor

```sql
Vendor {
  id            String       -- cuid, PK
  companyId     String       -- FK → Company.id
  name          String
  contactPerson String
  email         String?
  phone         String
  address       String?
  gstNumber     String?
  notes         String?
  status        VendorStatus -- ACTIVE | INACTIVE (default: ACTIVE)
  createdAt     DateTime
  updatedAt     DateTime
  deletedAt     DateTime?    -- soft delete
}

INDEXES:
  (companyId, deletedAt)          -- primary list query
  (companyId, email)              -- duplicate check
  (companyId, phone)              -- duplicate check
```

---

### PurchaseOrder

```sql
PurchaseOrder {
  id               String              -- cuid, PK
  companyId        String              -- FK → Company.id
  vendorId         String              -- FK → Vendor.id
  poNumber         String              -- UNIQUE globally (system-generated)
  description      String?
  amount           Float
  expectedDelivery DateTime?
  status           PurchaseOrderStatus -- PENDING|CONFIRMED|DELAYED|CANCELLED
  createdAt        DateTime
  updatedAt        DateTime
  deletedAt        DateTime?
}

INDEXES:
  (companyId, deletedAt)         -- list queries
  (companyId, status)            -- status filter
  (companyId, vendorId)          -- vendor filter
```

> **Note:** `poNumber` uniqueness is global (not per-company). This means PO numbers are never reused across any tenant. Auto-generation logic TBD.

---

### Call

```sql
Call {
  id              String     -- cuid, PK
  purchaseOrderId String     -- FK → PurchaseOrder.id
  vendorId        String     -- FK → Vendor.id
  status          CallStatus -- PENDING|IN_PROGRESS|COMPLETED|FAILED
  transcript      String?    -- raw transcript text
  startedAt       DateTime?
  endedAt         DateTime?
  duration        Int?       -- seconds
  createdAt       DateTime
  updatedAt       DateTime
}

INDEXES:
  (purchaseOrderId)
  (vendorId)
```

---

### CallResult

```sql
CallResult {
  id           String    -- cuid, PK
  callId       String    -- UNIQUE FK → Call.id (1:1)
  accepted     Boolean?  -- did vendor accept the PO?
  deliveryDate DateTime? -- confirmed delivery date
  quantity     Int?      -- confirmed quantity
  delayReason  String?   -- reason if delayed
  summary      String?   -- AI-generated call summary
  confidence   Float?    -- AI confidence score (0.0–1.0)
  createdAt    DateTime
  updatedAt    DateTime
}
```

---

### Notification

```sql
Notification {
  id        String           -- cuid, PK
  companyId String           -- FK → Company.id
  userId    String?          -- FK → User.id (null = company-wide)
  title     String
  message   String
  type      NotificationType -- INFO|WARNING|SUCCESS|ERROR (default: INFO)
  isRead    Boolean          -- default false
  metadata  Json?            -- arbitrary extra data
  createdAt DateTime
  readAt    DateTime?
  deletedAt DateTime?
}

INDEXES:
  (companyId, deletedAt, isRead)    -- unread list query
  (companyId, userId)               -- user-scoped query
```

---

### AuditLog

```sql
AuditLog {
  id        String   -- cuid, PK
  companyId String   -- FK → Company.id
  userId    String?  -- actor (null = system action)
  action    String   -- e.g. "VENDOR_CREATED", "PO_STATUS_UPDATED"
  entity    String   -- e.g. "vendor", "purchase_order"
  entityId  String   -- ID of the affected record
  changes   Json?    -- before/after snapshot
  ipAddress String?
  createdAt DateTime
}

INDEXES:
  (companyId, entity)     -- entity-type filter
  (companyId, createdAt)  -- chronological listing
```

## 3.3 ER Diagram

```
Company ──┬──< User
          ├──< Vendor ──────────────┬──< PurchaseOrder ──< Call ──── CallResult
          ├──< PurchaseOrder        │
          ├──< Notification         │    (Call also FK → Vendor)
          └──< AuditLog
```

## 3.4 Enum Reference

| Enum | Values |
|---|---|
| `UserRole` | `ADMIN`, `EMPLOYEE` |
| `VendorStatus` | `ACTIVE`, `INACTIVE` |
| `PurchaseOrderStatus` | `PENDING`, `CONFIRMED`, `DELAYED`, `CANCELLED` |
| `CallStatus` | `PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED` |
| `NotificationType` | `INFO`, `WARNING`, `SUCCESS`, `ERROR` |

---

# 4. API Reference

**Base URL:** `/api/v1`  
**Auth:** All routes (except `/health`) require the `X-Company-Id` header.  
**Content-Type:** `application/json`

All responses follow this envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "optional string",
  "pagination": { "page": 1, "limit": 10, "totalItems": 100, "totalPages": 10 }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Human-readable message",
  "details": [ ... ]   // Zod validation errors only
}
```

---

## 4.1 Health

### `GET /api/v1/health`
Returns API status and environment info. No auth required.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "environment": "development",
    "timestamp": "2026-08-16T09:00:00.000Z"
  }
}
```

---

## 4.2 Vendors

### `POST /api/v1/vendors`
Create a vendor.

**Body:**
```json
{
  "name": "Apex Components Ltd.",
  "contactPerson": "Rajesh Sharma",
  "phone": "+91 98765 43210",
  "email": "rajesh@apex.com",   // optional
  "address": "Pune, Maharashtra",  // optional
  "gstNumber": "27AAAPL1234C1Z5",  // optional
  "notes": "Preferred vendor"       // optional
}
```

**Validation rules:**
- `name`: 2–100 chars
- `contactPerson`: 2–100 chars
- `phone`: 10–15 chars
- `email`: valid email, optional
- Duplicate `email` or `phone` per company → 409 Conflict

---

### `GET /api/v1/vendors`
List vendors with pagination, search, and status filter.

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Page size (max 100) |
| `sort` | string | `createdAt` | Field to sort by |
| `order` | `asc\|desc` | `desc` | Sort direction |
| `search` | string | — | Full-text search on name, contact, email, phone |
| `status` | `ACTIVE\|INACTIVE` | — | Filter by status |

---

### `GET /api/v1/vendors/:id`
Get a single vendor by ID (404 if not found or soft-deleted).

---

### `PATCH /api/v1/vendors/:id`
Update vendor fields (partial update). All `createVendorSchema` fields optional, plus `status: ACTIVE|INACTIVE`.

---

### `DELETE /api/v1/vendors/:id`
Soft-delete a vendor (sets `deletedAt`).

---

## 4.3 Purchase Orders

### `POST /api/v1/purchase-orders`
Create a purchase order.

**Body:**
```json
{
  "vendorId": "clxxxxx",
  "description": "500 PCB assemblies",
  "amount": 284500,
  "expectedDelivery": "2026-08-20T00:00:00.000Z"
}
```

- `vendorId` must exist and belong to the company.
- `amount` must be positive.
- `expectedDelivery` must be an ISO datetime string.

---

### `GET /api/v1/purchase-orders`
List purchase orders.

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Page size (max 100) |
| `sort` | string | `createdAt` | One of: `poNumber`, `amount`, `status`, `expectedDelivery`, `createdAt` |
| `order` | `asc\|desc` | `desc` | Sort direction |
| `search` | string | — | Search on poNumber, description |
| `status` | `PENDING\|CONFIRMED\|DELAYED\|CANCELLED` | — | Status filter |
| `vendorId` | string | — | Filter by vendor |

---

### `GET /api/v1/purchase-orders/:id`
Get a single PO with linked vendor info and calls.

---

### `PATCH /api/v1/purchase-orders/:id`
Update description, amount, or expectedDelivery.

---

### `PATCH /api/v1/purchase-orders/:id/status`
Transition PO status. Enforces the state machine — invalid transitions return 422.

**Body:**
```json
{ "status": "CONFIRMED" }
```

---

### `DELETE /api/v1/purchase-orders/:id`
Soft-delete a PO.

---

## 4.4 Dashboard

### `GET /api/v1/dashboard/summary`
Summary card counts.

```json
{
  "vendorCount": 12,
  "activeVendors": 9,
  "inactiveVendors": 3,
  "totalOrders": 47,
  "pendingOrders": 8,
  "confirmedOrders": 22,
  "delayedOrders": 4,
  "cancelledOrders": 13
}
```

### `GET /api/v1/dashboard/activity`
10 most recently updated vendors and POs.

### `GET /api/v1/dashboard/metrics`
Total order value, average order value, and calls-by-status.

---

## 4.5 Analytics

### `GET /api/v1/analytics/monthly-orders`
Monthly order counts and total amount for the past 12 months.

### `GET /api/v1/analytics/vendor-performance`
Per-vendor: total orders, total calls, total order value, status distribution.

### `GET /api/v1/analytics/delay-analysis`
All DELAYED POs with delay-in-days computed from `expectedDelivery`.

### `GET /api/v1/analytics/status-distribution`
Count and total amount per `PurchaseOrderStatus`.

### `GET /api/v1/analytics/call-statistics`
Call counts by `CallStatus`. Placeholder `averageDuration` and `successRate` (null until CALL-E integration).

---

## 4.6 Notifications

### `POST /api/v1/notifications`
Create a notification. Used internally by other services; can also be called directly.

**Body:**
```json
{
  "title": "Delay Detected",
  "message": "PO-2025-0038 is delayed by 4 days",
  "type": "WARNING",
  "userId": "optional-user-id",
  "metadata": { "poId": "xxx" }
}
```

### `GET /api/v1/notifications`
List notifications with pagination. Query params: `isRead` (boolean), `type`.

### `GET /api/v1/notifications/unread-count`
`{ "unreadCount": 5 }`

### `PATCH /api/v1/notifications/:id/read`
Mark a single notification as read.

### `PATCH /api/v1/notifications/read-all`
Mark all company notifications as read.

### `DELETE /api/v1/notifications/:id`
Soft-delete a notification.

---

## 4.7 Audit Logs

### `GET /api/v1/audit-logs`
List audit log entries for the company with pagination. Query params: `entity`, `entityId`, `action`, date range.

---

# 5. Frontend Architecture

## 5.1 Routing Structure

```
/                          → redirect to /dashboard (or /login if not authed)
/(auth)/login              → Login page
/(auth)/register           → Register page (planned)
/(dashboard)/              → Dashboard home (summary + recent activity)
/(dashboard)/vendors       → Vendor list page
/(dashboard)/purchase-orders          → PO list page
/(dashboard)/purchase-orders/new      → Create PO page
/(dashboard)/purchase-orders/[id]     → PO detail page
/(dashboard)/call-history  → Call history log
/(dashboard)/ai-calls      → AI call management + real-time view
/(dashboard)/analytics     → Analytics charts
/(dashboard)/settings      → Company/user settings
```

## 5.2 Component Organization

```
components/
  ui/              ← shadcn/ui primitives (Button, Dialog, Table, etc.)
                     Never hand-edit — regenerate via npx shadcn add
  layout/          ← Sidebar, Topbar — persistent app shell
  shared/          ← Cross-feature: PageHeader, StatusBadge, etc.
  vendors/         ← VendorCard, VendorForm, VendorStatusBadge
```

## 5.3 Key Design Decisions

- **App Router (Next.js 16):** Route groups `(auth)` and `(dashboard)` share distinct layouts without affecting the URL.
- **Server Components default:** Pages are Server Components unless marked `"use client"`. Client components are used only where interactivity or browser APIs are needed.
- **Mock data layer:** All current data comes from `lib/mock-data.ts`. Real API calls will be wired in a future sprint. The mock data intentionally covers real-world scenarios (delays, different statuses, rich transcripts) to validate the UI design.
- **Tailwind v4 CSS-first:** No `tailwind.config.js`. All theme tokens (colors, fonts, spacing overrides) are defined in `app/globals.css`.
- **Zod not yet in frontend:** Form validation on the client side is currently basic. Zod is planned once proper auth forms and PO creation forms are fully wired.

## 5.4 Data Flow (Current — Mock)

```
page.tsx (Server Component)
    │
    └─► import { MOCK_VENDORS } from "lib/mock-data"
    │
    └─► renders components with static data
```

## 5.5 Data Flow (Target — Real API)

```
page.tsx (Server Component)
    │
    └─► fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/vendors`, {
              headers: { "X-Company-Id": companyId }
          })
    │
    └─► renders components with API data
```

## 5.6 Current Pages Implemented

| Page | Route | State |
|---|---|---|
| Dashboard home | `/(dashboard)/` | ✅ UI done (mock data) |
| Vendor list | `/(dashboard)/vendors` | ✅ UI done (mock data) |
| PO list | `/(dashboard)/purchase-orders` | ✅ UI done (mock data) |
| PO detail | `/(dashboard)/purchase-orders/[id]` | ✅ UI done (mock data) |
| PO create | `/(dashboard)/purchase-orders/new` | ✅ UI done (mock data) |
| AI Calls | `/(dashboard)/ai-calls` | ✅ UI done (mock data) |
| Analytics | `/(dashboard)/analytics` | ✅ UI done (mock data) |
| Call History | `/(dashboard)/call-history` | ✅ UI done (mock data) |
| Settings | `/(dashboard)/settings` | 🟡 Page exists (stub) |
| Login | `/(auth)/login` | 🟡 Page exists (stub) |

---

# 6. Current Gaps

This section catalogs every known technical gap, missing implementation, or placeholder in the codebase as of August 2026.

## 6.1 Authentication — Not Implemented

**Severity: Critical (blocks production)**

The company context is extracted from the `X-Company-Id` request header with no validation. Any client can impersonate any company by passing any company ID. There is no login, session management, or JWT verification.

**Planned:** Firebase Auth on the client → custom JWT exchange endpoint on the backend → JWT middleware replaces `companyContext`.

**What needs to be built:**
- Firebase Auth integration in `apps/web`
- `POST /api/v1/auth/exchange` endpoint (Firebase ID token → VendorFlow JWT)
- `authMiddleware` replacing `companyContext`
- JWT payload carries `companyId`, `userId`, `role`
- Protect all existing routes behind the JWT middleware

## 6.2 Frontend–Backend Not Wired

**Severity: High**

All frontend pages use `lib/mock-data.ts`. No real API calls exist anywhere in `apps/web`. The API is fully functional but completely disconnected from the frontend.

**What needs to be done per feature:**
1. Remove mock imports.
2. Add server-side `fetch` calls (or React Query client-side).
3. Handle loading states, errors, and empty states.
4. Add `NEXT_PUBLIC_API_URL` to `.env.local`.

## 6.3 CALL-E AI Integration — Not Implemented

**Severity: High (core product value)**

The entire AI voice calling feature exists only as mock data in the frontend. The backend has the `Call` and `CallResult` schema models, and the analytics endpoint returns placeholder `averageDuration: null` and `successRate: null` with a note: `"Call statistics will be fully populated when CALL-E is integrated"`.

**What needs to be built:**
- Integration with a voice AI provider (e.g., Bland.ai, Retell AI, Vapi, or a custom CALL-E service)
- `POST /api/v1/calls` — trigger an outbound call for a PO
- Webhook receiver for call events (started, completed, transcript ready)
- `CallResult` population from AI-extracted transcript data
- Real-time call status updates to the frontend (WebSocket or polling)

## 6.4 PO Number Auto-Generation

**Severity: Medium**

`poNumber` is defined as `@unique` in the schema but there is no auto-generation logic in `purchaseOrderRepository.create()`. The frontend mock data uses `PO-2025-XXXX` formatted strings. The current API would require callers to supply a `poNumber`, but the `createPurchaseOrderSchema` does not include it — meaning the current create flow would fail with a DB unique constraint error on `poNumber`.

**Fix needed:** Auto-generate `poNumber` in the repository `create()` method (e.g., sequential per company, or UUID-based).

## 6.5 Company Onboarding — Not Implemented

**Severity: High**

There is no way to create a `Company` record through the API. No registration flow exists. The system assumes a `Company` record already exists (manually seeded in the DB).

**What needs to be built:**
- `POST /api/v1/companies` (or part of auth flow) — create a company + first admin user
- Registration page in `apps/web`
- First-time setup flow

## 6.6 User Management — No API

**Severity: Medium**

The `User` model exists in the schema with `role` and `passwordHash`, but there are no CRUD endpoints for users. No way to add team members, change roles, or reset passwords through the API.

## 6.7 Mutation Rate Limiter Not Applied

**Severity: Low**

`mutationRateLimiter` is defined in `rate-limiter.middleware.ts` but is not applied to any route. Only the global `apiRateLimiter` (100 req / 15 min) is active.

## 6.8 AuditLog Missing `userId`

**Severity: Low**

`AuditLog.userId` is nullable (`String?`), and all current audit log writes pass `undefined` for `userId` because there is no auth context yet. Once auth is implemented, the authenticated user's ID must be forwarded to all service calls and into audit log entries.

## 6.9 Notification Service Not Triggered Automatically

**Severity: Medium**

The notification service has a `createSystemNotification()` convenience method, but it is not called anywhere in the current codebase (e.g., not triggered when a PO is delayed, when a call fails, etc.). Notifications can only be created via the API directly.

## 6.10 No Frontend Form Validation

**Severity: Low**

The frontend has no Zod schemas or validation library. Form validation relies on native HTML constraints only. Errors returned by the API are not displayed in the UI in a structured way.

## 6.11 Vendor `on_hold` Status in Frontend vs. Backend Mismatch

**Severity: Medium**

The frontend mock data (`lib/mock-data.ts`) defines `VendorStatus = "active" | "inactive" | "on_hold"`. The backend schema and DB only support `ACTIVE | INACTIVE`. `on_hold` does not exist in the backend.

## 6.12 `DELIVERED` PO Status in Frontend vs. Backend Mismatch

**Severity: Medium**

The frontend mock data uses `status: "delivered"` for POs. The backend `PurchaseOrderStatus` enum only has `PENDING | CONFIRMED | DELAYED | CANCELLED`. There is no `DELIVERED` status in the DB.

## 6.13 No Call Scheduling API

**Severity: Medium**

The frontend mock data includes `status: "scheduled"` for calls (i.e., a future call that hasn't happened yet). The backend `CallStatus` enum has `PENDING | IN_PROGRESS | COMPLETED | FAILED` — no `SCHEDULED` status. Call scheduling logic is entirely absent.

## 6.14 Settings Page is a Stub

**Severity: Low**

`/(dashboard)/settings` exists but contains no implemented functionality.

## 6.15 No Environment Variable Validation

**Severity: Low**

The backend reads env vars but it's not immediately clear how `config/env.ts` validates them. If `DATABASE_URL` is missing, the error will come from Prisma at query time rather than at startup.

## 6.16 Structured Logging Not in Frontend

**Severity: Low**

The backend uses Pino for structured logging. The frontend has no logging strategy — `console.log` is used ad-hoc.

---

# 7. Future Feature Modules

These are the planned major features in rough priority order.

## 7.1 Authentication & Authorization (P0)

**Scope:** Firebase Auth → JWT exchange, role-based access control (ADMIN vs EMPLOYEE), protected routes in both frontend and backend.

**Key components:**
- `POST /api/v1/auth/exchange` — accepts Firebase ID token, returns VendorFlow JWT with `{ companyId, userId, role }`
- JWT middleware replacing `companyContext`
- Frontend: `firebase` package already installed. Implement `signInWithEmailAndPassword`, `onAuthStateChanged`, token forwarding.
- Route guards in `(dashboard)/layout.tsx`
- Role-based UI: admins see settings, user management; employees see operational views only

## 7.2 CALL-E AI Voice Integration (P0)

**Scope:** The core product feature — outbound AI calls to vendors for PO confirmation.

**Key components:**
- Partner selection: Bland.ai / Retell AI / Vapi / custom (TBD)
- `POST /api/v1/calls` — trigger a call for a given PO; creates a `Call` record in `PENDING` state
- Webhook endpoint — receives call events from the AI provider, updates `Call.status`, stores transcript
- AI extraction pipeline — parses transcript into `CallResult` (deliveryDate, quantity, delayReason, confidence)
- Auto PO status update — if call result indicates delay, auto-transition PO to `DELAYED` and fire a `WARNING` notification
- Real-time updates — WebSocket or SSE to push call status changes to the frontend dashboard

**DB changes needed:**
- Add `SCHEDULED` to `CallStatus`
- Add `scheduledAt` field to `Call`

## 7.3 Company Onboarding & User Management (P1)

**Scope:** Self-serve company registration and team member management.

**Key components:**
- `POST /api/v1/auth/register` — create company + admin user
- `GET/POST/PATCH/DELETE /api/v1/users` — CRUD for team members (admin only)
- Invite-by-email flow
- Password reset via Firebase
- Registration and invite-acceptance pages in frontend

## 7.4 DELIVERED Status & Full PO Lifecycle (P1)

**Scope:** Complete the purchase order lifecycle by adding a `DELIVERED` terminal state.

**Key components:**
- Add `DELIVERED` to `PurchaseOrderStatus` enum
- New valid transitions: `CONFIRMED → DELIVERED`
- Frontend: delivery confirmation UI, delivery date recording
- Align frontend mock data `VendorStatus` and `POStatus` with backend

## 7.5 Vendor `ON_HOLD` Status (P1)

**Scope:** Add the `on_hold` / `ON_HOLD` vendor status that already exists in the frontend mock data.

**Key components:**
- Add `ON_HOLD` to `VendorStatus` enum in Prisma schema
- Update validators to include the new status
- Block new POs from being raised against ON_HOLD vendors
- Frontend status badge and filter

## 7.6 Real-Time Notifications (P1)

**Scope:** Push notifications to connected users when key events occur (delays detected, calls completed, POs confirmed).

**Key components:**
- WebSocket or SSE channel per company
- Auto-trigger `createSystemNotification()` from services:
  - PO delayed → WARNING notification
  - Call completed → INFO notification with summary
  - Call failed → ERROR notification
- Notification bell UI in topbar with real-time unread count
- Frontend notification drawer/panel

## 7.7 Vendor Portal (P2)

**Scope:** A lightweight web portal where vendors can log in to view their POs and confirm/update status without a phone call.

**Key components:**
- Separate Next.js route group or standalone app
- Vendor authentication (email + OTP)
- Read-only PO view + confirmation flow
- Integration with the `CallResult` model for structured vendor responses

## 7.8 ERP / Procurement System Integration (P2)

**Scope:** Sync VendorFlow POs with external ERP systems (SAP, Oracle, Tally, Zoho Books, etc.).

**Key components:**
- Webhook outbound: fire events on PO status changes
- Webhook inbound: receive new POs created in ERP
- OAuth2-based partner integration framework
- Field mapping configuration per integration

## 7.9 Advanced Analytics & Reporting (P2)

**Scope:** Richer BI features beyond the current 5 analytics endpoints.

**Features:**
- Vendor scorecard (reliability score, on-time rate, response time trend)
- Revenue-at-risk dashboard (total value of delayed/pending POs)
- Downloadable reports (CSV / PDF)
- Custom date range filters on all analytics
- Forecasting: predicted delivery success based on historical vendor performance

## 7.10 Call Scheduling & Queue Management (P2)

**Scope:** Allow procurement teams to schedule AI calls in advance, manage a call queue, and set retry policies.

**Key components:**
- Call scheduler (cron-based or job queue — BullMQ or similar)
- `scheduledAt` field on `Call`
- Priority queuing (DELAYED POs get called first)
- Retry policies (no-answer → retry in N hours)
- Call history feed with filtering and search

## 7.11 Mobile App (P3)

**Scope:** React Native app (or PWA) for on-the-go procurement management.

**Features:**
- Push notifications for delay alerts
- PO status view and approve/reject flows
- Quick vendor contact directory

## 7.12 AI Insights & Recommendations (P3)

**Scope:** Proactive AI-generated insights beyond call transcripts.

**Features:**
- "Vendor at risk" prediction based on historical call data
- Automated delay reason categorisation
- Suggested alternate vendors when primary vendor is delayed
- PO value-at-risk heatmap

---

*End of VendorFlow Documentation*
