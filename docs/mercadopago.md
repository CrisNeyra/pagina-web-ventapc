# Mercado Pago (Checkout Pro)

Guía de webhook, tarjetas de prueba y rotación de tokens. El código vive en `src/app/api/payments/mercadopago/` y `src/lib/payments-server.ts`.

## Webhook: no se configura abriendo la URL

Abrir en el navegador

`https://TU-DOMINIO/api/payments/mercadopago/webhook`

**no registra el webhook.** Esa ruta es un receptor: Mercado Pago la llama con `GET`/`POST` cuando hay un pago. Sin `id` de pago, el handler responde `received` / `ignored` (o un JSON de ayuda). Una página negra o un JSON vacío no significa que el destination esté creado.

### Cómo configurarlo (panel MP)

1. [developers.mercadopago.com](https://www.mercadopago.com.ar/developers) → tu aplicación Aura Pro.
2. **Webhooks** / **Notificaciones** (a veces en “Tus integraciones”).
3. URL (exacta, HTTPS), según el deploy:

```text
https://proaurapro.vercel.app/api/payments/mercadopago/webhook
```

o, si el proyecto es el de GitHub:

```text
https://pagina-web-ventapc.vercel.app/api/payments/mercadopago/webhook
```

4. Eventos: **Pagos** (`payment`). Si aparece, también `merchant_order`.
5. Guardar. El panel muestra una **clave secreta**. Copiala a `MERCADOPAGO_WEBHOOK_SECRET` (`.env.local` y Vercel) y redeploy. Sin esa variable el aviso se procesa igual; con ella, una firma inválida responde 401 y no marca el pedido.
6. Probar con “Enviar notificación de prueba” si el panel lo ofrece.

El código ya pone `notification_url` al crear la preferencia; el panel es el respaldo y lo que MP recomienda.

La firma usa el header `x-signature` (`ts` + `v1`) y `x-request-id`, con el manifest `id:{data.id};request-id:{x-request-id};ts:{ts};`.

Local: ngrok/Cloudflare Tunnel apuntando a `http://localhost:3000` y la misma path `/api/payments/mercadopago/webhook`.

## Tarjetas y cuentas de prueba

Doc oficial (Argentina):

- [Tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-info/test-cards)
- [Cuentas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-info/test-accounts)
- [Checkout Pro](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/overview)

Pagá **logueado con un usuario comprador de prueba** (no con la cuenta vendedora). Confirmá números en la doc (MP los actualiza). Valores típicos:

| Resultado | Número (ejemplo doc AR) | Vencimiento | CVV | Nombre |
|-----------|-------------------------|-------------|-----|--------|
| Aprobado | `5031 7557 3453 0604` (Mastercard) o Visa que liste la doc | Cualquier fecha futura | `123` | `APRO` |
| Rechazado | La que la doc marque como rejected | futura | `123` | `OTHE` / el que indique MP |

DNI/CUIT: el que pida el formulario de test (a veces `12345678`).

## Modo prueba vs dominio propio

| Qué | ¿Hace falta dominio propio? |
|-----|-----------------------------|
| Mercado Pago **credenciales de prueba** + Checkout Pro | No. `vercel.app` alcanza. |
| Google OAuth “Prueba” vs “Publicar” | No. Publicar app deja entrar cualquier Gmail; verificar **marca** sí pide dominio. |
| Resend mails a clientes reales | Sí, dominio propio. |

### Paso a paso pago test

1. Webhook en el panel (arriba).
2. Checkout local o producción, logueado.
3. Débito o crédito → Pagar con Mercado Pago.
4. Login **comprador de prueba** de MP.
5. Tarjeta de la tabla / doc.
6. Volvés a `/checkout/exito`. En `/admin`, con una cuenta **admin**, el pedido pasa a Pagado y muestra el ID de pago (`mercadopagoPaymentId`) cuando llega el webhook. Si no cambia, revisá que la URL del panel sea la del deploy y que `MERCADOPAGO_WEBHOOK_SECRET` coincida con la clave del panel.

## Rotar Access Token (si se filtró o caducó)

1. En MP: aplicación → **Credenciales de prueba** → regenerar Access Token (y Public Key si el panel lo rota junto).
2. Pegar **solo prueba** en `.env.local`:

```env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=
```

3. En Vercel → Settings → Environment Variables: reemplazar las mismas dos en Production, Preview y Development. Quitar valores viejos.
4. Redeploy (Deployments → Redeploy) y reiniciar `npm run dev`.
5. No commitear secretos. No pegar tokens de **producción** en el chat.

Si las keys ya están en `.env.local` y Vercel y no se filtraron, no hace falta rotar.
