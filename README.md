# LMS de Cursos

Plataforma propia B2C para vender y dictar cursos de IA aplicada a productos digitales. El detalle de producto está en [PRD.md](PRD.md).

## Stack

Next.js (App Router) · TypeScript · Postgres

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # completar AUTH_SECRET (openssl rand -base64 32)
docker compose up -d         # Postgres local en :5432
npm run db:migrate           # aplica db/migrations
npm run db:seed              # curso de ejemplo (opcional)
npm run dev                  # http://localhost:3000
```

## Pagos con Mercado Pago

Completar en `.env.local` `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` y `APP_URL` (credenciales de prueba del panel de desarrolladores). Mercado Pago avisa los pagos a `POST /api/mercadopago/webhook`; en local hace falta exponer la app con un túnel (por ejemplo ngrok) y usar esa URL como `APP_URL`.

## Scripts

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción
- `npm run start`: sirve el build
- `npm run lint`: ESLint
- `npm run db:migrate`: aplica las migraciones pendientes (lee `.env.local`)
- `npm run db:seed`: carga un curso de ejemplo con 3 clases
- `npm run db:enroll -- <email> <slug>`: solo desarrollo, da acceso a un curso sin comprarlo
