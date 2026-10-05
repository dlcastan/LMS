# LMS de Cursos

Plataforma propia B2C para vender y dictar cursos de IA aplicada a productos digitales. El detalle de producto está en [PRD.md](PRD.md).

## Estado

| Funcionalidad | Estado |
| --- | --- |
| Home pública, registro, login y logout | Hecho |
| Cursos, clases, marcar clase vista y % de avance | Hecho |
| Compra con Mercado Pago y habilitación por webhook (idempotente) | Hecho, probado contra un mock; falta probar con credenciales reales |
| Video protegido (Bunny Stream, URLs firmadas, marca de agua) | Pendiente: hoy la clase muestra un placeholder |
| Recuperar contraseña, editar datos, historial de compras | Pendiente |
| Certificado de completitud | Pendiente |
| Reconciliación de pagos, reversiones y forzado manual (RF-16 a RF-18) | Pendiente |
| Panel de administración | Pendiente: los cursos se cargan con `npm run db:seed` |

## Stack

Next.js 16 (App Router) · TypeScript · Postgres · `jose` (sesión) · `pg`

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # completar AUTH_SECRET (openssl rand -base64 32)
docker compose up -d         # Postgres local en :5432
npm run db:migrate           # aplica db/migrations
npm run db:seed              # curso de ejemplo (opcional)
npm run dev                  # http://localhost:3000
```

Con el curso de ejemplo cargado: registrate en `/registro`, entrá a "Mi cuenta" y verás el curso en "Cursos disponibles". Para ver el contenido sin pasar por el pago, `npm run db:enroll -- <tu-email> ia-aplicada-a-productos-digitales`.

## Variables de entorno

Se definen en `.env.local` (no se commitea). `.env.example` es la plantilla.

| Variable | Para qué |
| --- | --- |
| `DATABASE_URL` | Conexión a Postgres. El `docker-compose.yml` usa `postgres://lms:lms@localhost:5432/lms` |
| `AUTH_SECRET` | Secreto para firmar la cookie de sesión |
| `APP_URL` | URL pública de la app. Mercado Pago la usa para volver y para notificar |
| `MERCADOPAGO_ACCESS_TOKEN` | Access token de Mercado Pago (credenciales de prueba en desarrollo) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secreto con el que se verifica la firma del webhook |
| `MERCADOPAGO_SANDBOX` | `true` para usar el checkout sandbox |
| `MERCADOPAGO_API_URL` | Opcional. Solo para pruebas contra un mock; por defecto `https://api.mercadopago.com` |
| `BUNNY_STREAM_*` | Reservadas para la integración de video (todavía no se usan) |

## Pagos con Mercado Pago

1. El alumno elige un curso en `/comprar/<slug>` y el sistema crea una compra pendiente y una preferencia de pago.
2. Mercado Pago avisa el resultado a `POST /api/mercadopago/webhook`.
3. El webhook verifica la firma, consulta el pago a la API de Mercado Pago y, si está aprobado y coincide con el monto de la compra, habilita el curso. Repetir la misma notificación no genera cambios.

Para que Mercado Pago llegue al webhook en local hace falta exponer la app con un túnel (por ejemplo ngrok) y usar esa URL como `APP_URL`.

## Scripts

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción
- `npm run start`: sirve el build
- `npm run lint`: ESLint
- `npm run db:migrate`: aplica las migraciones pendientes (lee `.env.local`)
- `npm run db:seed`: carga un curso de ejemplo con 3 clases y precio
- `npm run db:enroll -- <email> <slug>`: solo desarrollo, da acceso a un curso sin comprarlo

## Estructura

```
db/migrations/      esquema SQL (users, cursos y clases, compras)
scripts/            migrate, seed y enroll
src/app/            rutas: home, registro, login, cuenta, cursos, comprar, api
src/app/actions/    server actions (auth, progreso, compra)
src/lib/            acceso a datos, sesión, contraseñas, Mercado Pago, compras
src/proxy.ts        protege /cuenta, /cursos y /comprar con la sesión
```

Antes de escribir código de Next.js, leer [AGENTS.md](AGENTS.md): esta versión tiene cambios incompatibles con versiones anteriores.
