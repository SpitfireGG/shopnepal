# ShopNepal — Monorepo

**Stack:** Next.js 16 + TS + Tailwind 4 + shadcn/ui (frontend & admin) + NestJS + Postgres (backend)

## Structure (monorepo — HTML/CSS/JS legacy excluded)
```
shopnepal/
├── apps/
│   ├── backend/   # NestJS — core/common/integrations/modules/events/commands
│   ├── frontend/  # ShopNepal storefront — Next.js 3002 (100% alike, NPR, Nepal)
│   └── admin/     # ShopNepal Admin — Next.js 3003 (standalone)
├── docker-compose.yml  # postgres 5434 + backend 3000
└── package.json   # workspaces
```
Legacy `index.html / assets / shop.css` **excluded** — fully migrated to Next.js.

## Quick start
```bash
docker compose up -d              # postgres 5434 + backend 3000
npm run dev:frontend              # → http://localhost:3002
npm run dev:admin                 # → http://localhost:3003 (admin/shopnepal123)
npm run dev:backend              # → http://localhost:3000 (if not docker)
```

## Ports
- `3000` backend API (Nest) — `/api/*`
- `3002` frontend Next.js
- `3003` admin Next.js standalone
- `5434` Postgres `shopnepal/shopnepal123`

## Admin
Login `admin / shopnepal123`

## DB
```bash
DATABASE_URL=postgres://shopnepal:shopnepal123@localhost:5434/shopnepal npm --prefix apps/backend run seed
docker exec shopnepal_postgres psql -U shopnepal -d shopnepal -c "\dt"
```
