# Auditoría de código — septiembre 2026

Informe de revisión (desarrollador senior + QA) sobre Aura Pro tras el corte Nest-only, ficha estilo Mercado Libre y fixes de auth/checkout.

## Alcance

Front Next.js (`src/`), API Nest (`api/`), CI y docs. No se auditaron secretos (`.env.local`).

## Código muerto (limpiado en el mismo commit)

| Item | Motivo |
|------|--------|
| `src/lib/email.test.ts` | Importaba `./email` ya migrado a Nest (`api/src/email/`) |
| `src/lib/rate-limit.ts` y su test | Nadie en Next lo usaba; el límite real está en Nest + Redis + Throttler |
| Dependencias `lucide-react` y `zod` | Cero imports en el repo |

## No se borró (uso real o dudoso)

- `src/app/productos/[archivo]/route.ts` — redirect a placeholder para URLs de imagen rotas.
- `src/datos/preciosCatalogo.ts` — el checkout Stripe del front sigue validando contra este mapa (deuda, no dead code).

## Buenas prácticas

- Un solo camino: Next + Nest + Prisma/PostgreSQL. CI con guard anti-Firebase.
- Auth JWT, cookie `aura_token`, proxy en `/usuario` y `/checkout`.
- Health API, emails Resend opcionales, CVs en disco si no hay MinIO.
- Timeouts en `apiFetch`, redirect post-login, CTAs de checkout visibles.
- Vitest + lint-staged + Husky.

## Malas prácticas y cómo actuar

1. **Catálogo doble** (estático + API + `preciosCatalogo`) — Stripe puede devolver `PRICE_MISMATCH`. *Acción:* validar precios solo en Nest; el front deja de duplicar el catálogo.
2. **E2E Playwright** — `webServer` usa `npm run start` (cuelga si no hay build). El spec Nest se skipea si la API no está. *Acción:* en local `reuseExistingServer`; en CI el workflow ya hace `build` antes.
3. **Cache Turbopack** — `.next` corrupto deja clicks muertos. *Acción:* parar `dev`, borrar `.next`, `npm run dev` de nuevo.
4. **Password 6 caracteres** — la UI exige formato; Nest no. *Acción:* DTO con `class-validator` alineado al regex del front.
5. **Specs de ficha genéricas** — “datos de tienda” iguales para todos. *Mejora:* campo specs en Prisma cuando haya datos reales.
6. **Demo 24/7** — Neon + Railway es configuración de cuentas, no código. Ver `docs/demo-cloud.md`.

## QA — flujos a re-probar

- Login `admin@aurapro.com` / `1234ab` y registro (password `1234ab`).
- Ficha producto: galería, comprar ahora → checkout, agregar al carrito.
- Checkout retiro + efectivo.
- Si `npm run test:e2e` cuelga: usar el `dev` ya levantado (`reuseExistingServer`) o build + start.
