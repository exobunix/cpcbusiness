# CPCBusiness Platform

Enterprise digital agency platform — public marketing website, admin panel (CRM, projects, invoices, AI), and client portal.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/cpcbusiness run dev` — run the frontend (port assigned via PORT env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + Pino logging
- DB: PostgreSQL + Drizzle ORM (lib/db)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in lib/api-spec)
- Frontend: React + Vite, Wouter routing, TanStack Query, Framer Motion, shadcn/ui
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — Drizzle schema (source of truth for all 12 tables)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — generated React Query hooks + Zod schemas
- `artifacts/api-server/src/routes/` — 14 Express route files
- `artifacts/cpcbusiness/src/pages/` — public/, auth/, admin/, client/ pages
- `artifacts/cpcbusiness/src/components/layouts/` — AdminLayout, ClientLayout, PublicNav, PublicFooter
- `artifacts/cpcbusiness/src/index.css` — emerald theme (hsl 152 69% 40%), glass utilities

## Demo credentials

- Admin: `admin@cpcbusiness.com` / `admin123`
- Client: `client@example.com` / `client123`
- Auth uses SHA256 hash with "cpc_salt" suffix; token format: `userId:email:timestamp` base64-encoded

## Architecture decisions

- Contract-first: OpenAPI spec → codegen → typed hooks. Never hand-write API calls.
- Orval hooks: params passed as first argument directly (e.g. `useGetLeads({ stage: 'new' })`), NOT wrapped in `{ params: ... }`.
- Auth tokens stored in localStorage under key `cpc_token`; `getAuthToken()` from `lib/auth.ts` is used by the custom fetch client.
- Invoice finance summary route `/invoices/finance/summary` registered BEFORE `/invoices/:id` to avoid route shadowing.
- All server logging via `req.log` (request context) or the `logger` singleton — never `console.log`.

## Product

- **Public site**: Homepage, Services, Portfolio, About, Contact
- **Admin panel** (12 pages): Dashboard, Leads (Kanban), Clients, Projects, Tasks (Kanban), Team, Invoices, Tickets, Services CMS, Portfolio CMS, AI Center, Messages
- **Client portal** (6 pages): Dashboard, Projects, Invoices, Tickets, Messages, Notifications

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Orval-generated hooks take params as first argument, NOT `{ params: ... }`. Always check generated api.ts signature.
- `pnpm --filter @workspace/api-spec run codegen` is the correct codegen command (package name is `api-spec`).
- Portfolio table has no `status` column — use `is_active` boolean instead.
- Run `pnpm --filter @workspace/db run push` after any schema change before restarting the API server.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
