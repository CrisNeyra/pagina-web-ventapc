-- CreateSchema
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');
CREATE TYPE "OrderStatus" AS ENUM ('pending_payment', 'pending_cash', 'pending_transfer', 'paid', 'payment_failed', 'cancelled', 'ready_for_pickup', 'shipped');
CREATE TYPE "PostulacionStatus" AS ENUM ('recibida', 'revisada', 'rechazada');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "firebase_uid" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 10,
    "en_stock" BOOLEAN NOT NULL DEFAULT true,
    "categoria" TEXT NOT NULL,
    "imagenes" JSONB NOT NULL DEFAULT '[]',
    "etiqueta" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT,
    "estado" "OrderStatus" NOT NULL DEFAULT 'pending_payment',
    "metodo_pago" TEXT,
    "total_pesos" INTEGER NOT NULL,
    "costo_envio" INTEGER NOT NULL DEFAULT 0,
    "stripe_amount_cents" INTEGER,
    "stripe_payment_intent_id" TEXT,
    "entrega" JSONB,
    "cuotas" INTEGER,
    "idempotency_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio_unitario" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "postulaciones" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "cv_path" TEXT NOT NULL,
    "cv_nombre" TEXT NOT NULL,
    "estado" "PostulacionStatus" NOT NULL DEFAULT 'recibida',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "postulaciones_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_config" (
    "clave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "site_config_pkey" PRIMARY KEY ("clave")
);

CREATE TABLE "shipping_zones" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigos_postales" TEXT[],
    "costo" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pc_builds" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "items" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pc_builds_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE UNIQUE INDEX "orders_stripe_payment_intent_id_key" ON "orders"("stripe_payment_intent_id");
CREATE UNIQUE INDEX "orders_idempotency_key_key" ON "orders"("idempotency_key");
CREATE INDEX "products_categoria_idx" ON "products"("categoria");
CREATE INDEX "products_en_stock_idx" ON "products"("en_stock");
CREATE INDEX "orders_estado_idx" ON "orders"("estado");
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX "postulaciones_estado_idx" ON "postulaciones"("estado");
CREATE INDEX "pc_builds_user_id_idx" ON "pc_builds"("user_id");

ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pc_builds" ADD CONSTRAINT "pc_builds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
