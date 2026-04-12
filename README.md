# Aura Pro - E-commerce Gamer

Plataforma de e-commerce ficticia orientada a hardware gamer y componentes de PC, construida con Next.js 14, TypeScript y Supabase.

## Stack Tecnológico

### Frontend
- Next.js 14 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (estado global para búsqueda, carrito y builder)
- Sonner (toasts y feedback visual)
- React Icons

### Backend / Servicios
- Supabase Auth (registro, login, sesión)
- Supabase Postgres (persistencia de builds de PC)
- API routes de Next.js (`src/app/**/route.ts`)

## Arquitectura del Proyecto

```txt
src/
  app/                  # Rutas App Router (home, productos, notebooks, usuario, etc.)
  componentes/          # Componentes UI reutilizables
  context/              # AuthContext y providers
  datos/                # Catálogo estático, navegación y datasets UI
  store/                # Zustand stores (carrito, búsqueda, builder)
  servicios/            # Integraciones y lógica de guardado (Supabase)
  configuracion/        # Clientes/config de Supabase y entorno
  tipos/                # Tipos TypeScript de dominio
public/
  productos/            # Imágenes de catálogo
  banners/              # Banners home
  assets/               # SVGs y recursos auxiliares
```

## Variables de Entorno

Creá `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU-ANON-KEY
```

Referencia disponible en `.env.local.example`.

## Instalación y Ejecución

1. Instalar dependencias:

```bash
npm install
```

2. Levantar entorno local:

```bash
npm run dev
```

3. Abrir en navegador:

```txt
http://localhost:3000
```

## Scripts Disponibles

- `npm run dev` - entorno de desarrollo
- `npm run build` - build de producción
- `npm run start` - servir build de producción
- `npm run lint` - validación de código con ESLint

## Funcionalidades Implementadas

- Home cyberpunk con hero de video y beneficios.
- Búsqueda global con autocompletado y navegación a producto.
- Catálogo dinámico con categorías, productos destacados y listados.
- Página de detalle de producto con galería de 3 imágenes.
- Carrito lateral con actualización de cantidades.
- Armá tu PC (builder por categorías de componentes).
- Autenticación de usuario con Supabase.
- Área de usuario con perfil, compras, métodos de pago, soporte y valoración.
- Botón flotante de WhatsApp con diálogo estilo widget.

## Criterios de Imágenes de Productos

- Convención principal recomendada:
  - `/public/productos/{id}-principal.jpg`
  - `/public/productos/{id}-img2.jpg`
  - `/public/productos/{id}-img3.jpg`
- El frontend contempla fallback a placeholder si una imagen no está disponible.

## Calidad y Buenas Prácticas

- Tipado estricto con TypeScript en dominio y componentes.
- Separación por capas (UI, datos, servicios, estado).
- Componentes desacoplados y reutilizables.
- Experiencia responsive para desktop y mobile.
- Feedback de interacción con notificaciones y estados visuales.

## Roadmap Técnico Recomendado

- Persistir historial real de compras en Supabase.
- CRUD completo de métodos de pago por usuario.
- Panel de administración de catálogo.
- Pruebas unitarias y E2E (Vitest + Playwright).
- Métricas y observabilidad (logs, tiempos de carga, errores).

## Despliegue

El proyecto está preparado para deploy en Vercel:

1. Conectar repositorio a Vercel.
2. Configurar variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Deploy automático por push a rama principal.
