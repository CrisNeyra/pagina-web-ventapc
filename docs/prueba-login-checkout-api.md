# Prueba: login + checkout

```env
DATABASE_URL=postgresql://...neon.tech/...?sslmode=require
JWT_SECRET=secreto-largo
```

```bash
npm run db:setup
npm run dev
```

Probar en el browser: registro/login → carrito → checkout efectivo/transferencia → `/admin`.

Checkout Pro: `MERCADOPAGO_ACCESS_TOKEN` en el servidor y la guía [`mercadopago.md`](mercadopago.md).
