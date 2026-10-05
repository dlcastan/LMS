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
npm run dev                  # http://localhost:3000
```

## Scripts

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción
- `npm run start`: sirve el build
- `npm run lint`: ESLint
- `npm run db:migrate`: aplica las migraciones pendientes (lee `.env.local`)
