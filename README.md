# LMS de Cursos

Plataforma propia B2C para vender y dictar cursos de IA aplicada a productos digitales. El detalle de producto está en [PRD.md](PRD.md).

## Stack

Next.js (App Router) · TypeScript · Postgres

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # completar los valores
npm run dev                  # http://localhost:3000
```

## Scripts

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción
- `npm run start`: sirve el build
- `npm run lint`: ESLint
