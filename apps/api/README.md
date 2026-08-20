# VendorFlow — Backend API (`apps/api`)

Production-ready backend for **VendorFlow**, an AI-powered Vendor Communication Platform built with clean architecture, strict multi-tenancy, and modular design.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | [Bun](https://bun.sh/) (v1.3+) |
| **Framework** | [Express 5](https://expressjs.com/) |
| **Language** | TypeScript (Native execution via Bun) |
| **ORM** | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` |
| **Database** | PostgreSQL on [Neon](https://neon.tech/) (Serverless) |
| **Validation** | [Zod](https://zod.dev/) |
| **Logging** | [Pino](https://getpino.io/) + `pino-http` + `pino-pretty` |
| **Security** | Helmet, CORS, Express Rate Limit |

---

## Architecture Overview

VendorFlow follows **Feature-Based Clean Architecture**:

```
apps/api/src/
├── config/                  # Validated environment configuration (fails fast on startup)
│   └── env.ts
├── constants/               # Global constants (pagination, rate limits, audit actions)
│   └── index.ts
├── controllers/             # Controller layer (thin: parse req → call service → format response)
│   ├── analytics.controller.ts
│   ├── audit-log.controller.ts
│   ├── dashboard.controller.ts
│   ├── health.controller.ts
│   ├── notification.controller.ts
│   ├── purchase-order.controller.ts
│   └── vendor.controller.ts
├── errors/                  # Custom application errors (AppError, ValidationError, NotFoundError...)
│   ├── app-error.ts
│   └── index.ts
├── lib/                     # Singletons & external clients (Prisma client, Pino logger)
│   ├── logger.ts
│   └── prisma.ts
├── middlewares/             # Express middlewares
│   ├── company-context.middleware.ts
│   ├── error-handler.middleware.ts
│   ├── not-found.middleware.ts
│   ├── rate-limiter.middleware.ts
│   ├── request-logger.middleware.ts
│   └── validate.middleware.ts
├── repositories/            # Data access layer (Prisma queries with multi-tenancy & soft delete)
│   ├── analytics.repository.ts
│   ├── audit-log.repository.ts
│   ├── dashboard.repository.ts
│   ├── notification.repository.ts
│   ├── purchase-order.repository.ts
│   └── vendor.repository.ts
├── routes/                  # Express route definitions with validation middlewares
│   ├── analytics.routes.ts
│   ├── audit-log.routes.ts
│   ├── dashboard.routes.ts
│   ├── health.routes.ts
│   ├── notification.routes.ts
│   ├── purchase-order.routes.ts
│   └── vendor.routes.ts
├── services/                # Business logic layer
│   ├── analytics.service.ts
│   ├── audit-log.service.ts
│   ├── dashboard.service.ts
│   ├── health.service.ts
│   ├── notification.service.ts
│   ├── purchase-order.service.ts
│   └── vendor.service.ts
├── types/                   # Shared TypeScript types and Express augmentation
│   ├── api.types.ts
│   └── express.d.ts
├── utils/                   # Reusable utilities
│   ├── api-response.ts
│   ├── async-handler.ts
│   ├── date-formatter.ts
│   └── paginator.ts
├── app.ts                   # Express app setup & middleware chain
└── server.ts                # HTTP server bootstrap & graceful shutdown
```

---

## Core Design Principles

1. **Strict Multi-Tenancy**: Every query enforces `where: { companyId, deletedAt: null }`.
2. **Soft Deletes**: Deletions update `deletedAt: new Date()` instead of dropping rows.
3. **Thin Controllers**: No business logic or database access in controllers.
4. **Standardized Responses**: Every endpoint returns the standard envelope:
   ```json
   // Success:
   {
     "success": true,
     "message": "...",
     "data": {}
   }

   // Error:
   {
     "success": false,
     "message": "...",
     "errors": []
   }
   ```
5. **Auditing**: Every critical mutation automatically logs an entry to `AuditLog`.

---

## API Endpoints

All routes are prefixed with `/api/v1`.

### 1. Health (Public)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | DB connection, memory, uptime, latency |

### 2. Vendors (Protected: `X-Company-Id`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/vendors` | Create vendor (duplicate email/phone check) |
| `GET` | `/vendors` | List vendors (pagination, search, filter, sort) |
| `GET` | `/vendors/:id` | Get vendor details with recent POs |
| `PATCH` | `/vendors/:id` | Update vendor |
| `DELETE` | `/vendors/:id` | Soft-delete vendor |

### 3. Purchase Orders (Protected: `X-Company-Id`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/purchase-orders` | Create PO (auto-generates `PO-YYYYMMDD-XXXX`) |
| `GET` | `/purchase-orders` | List POs (pagination, status filter, vendor filter) |
| `GET` | `/purchase-orders/:id` | Get PO details with call history |
| `PATCH` | `/purchase-orders/:id` | Update PO description / amount / delivery |
| `PATCH` | `/purchase-orders/:id/status` | Update status (`PENDING` → `CONFIRMED`/`DELAYED`/`CANCELLED`) |
| `DELETE` | `/purchase-orders/:id` | Soft-delete PO |

### 4. Dashboard (Protected: `X-Company-Id`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/summary` | Summary card counters (vendors, active, PO status breakdown) |
| `GET` | `/dashboard/activity` | Recent vendors and POs |
| `GET` | `/dashboard/metrics` | Total order value, average order value, call counts |

### 5. Analytics (Protected: `X-Company-Id`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/monthly-orders` | 12-month order count and revenue trends |
| `GET` | `/analytics/vendor-performance` | Vendor breakdown (orders, value, status distribution) |
| `GET` | `/analytics/delay-analysis` | Average delay days and delayed order breakdown |
| `GET` | `/analytics/status-distribution` | Distribution across all order statuses |
| `GET` | `/analytics/call-statistics` | Call stats (clean placeholder for CALL-E) |

### 6. Notifications (Protected: `X-Company-Id`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/notifications` | Create notification |
| `GET` | `/notifications` | List notifications (paginated, `isRead` filter) |
| `GET` | `/notifications/unread-count` | Unread notifications count |
| `PATCH` | `/notifications/:id/read` | Mark single notification as read |
| `PATCH` | `/notifications/read-all` | Mark all notifications as read |
| `DELETE` | `/notifications/:id` | Soft-delete notification |

### 7. Audit Logs (Protected: `X-Company-Id`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/audit-logs` | Query audit trail (entity, action, entityId filter) |

---

## Environment Setup

Create `.env` inside `apps/api/`:

```ini
# PostgreSQL (Neon serverless connection string)
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"

# Server
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:3001

# Placeholders for future integrations
GEMINI_API_KEY=placeholder_replace_me
JWT_SECRET=placeholder_replace_me
```

---

## Running Locally

From `apps/api/`:

```bash
# Install dependencies
bun install

# Generate Prisma Client
npx prisma generate

# Apply database migrations
npx prisma migrate dev

# Start development server with hot-reload
bun run dev
```

---

## Testing with Postman

Import the collection at `apps/api/postman/vendorflow-api.postman_collection.json` into Postman.

It includes pre-configured collection variables:
- `baseUrl`: `http://localhost:3001/api/v1`
- `companyId`: Pre-populated with your tenant ID

---

## Deployment Guide

### Neon (PostgreSQL)
The database is hosted on Neon serverless PostgreSQL. The connection string includes `sslmode=require` and uses `@prisma/adapter-pg` connection pooling.

### Render / Railway / Docker
Use the standard Dockerfile or Bun start command:
```bash
bun src/server.ts
```

Set environment variables in your deployment dashboard:
- `DATABASE_URL`
- `PORT` (assigned by platform)
- `NODE_ENV=production`
- `APP_URL` (frontend URL for CORS)

---

## Future Integration Points

- **Authentication**: Replace `companyContext` middleware with Firebase Auth verification + JWT claims extraction.
- **CALL-E Voice Agents**: The `Call` and `CallResult` Prisma models and `analytics.service.ts` call statistics endpoints are wired and ready to connect to CALL-E webhooks.
- **Gemini Intelligence**: `GEMINI_API_KEY` placeholder is present in `.env` and `src/config/env.ts` for future LLM transcript analysis.
