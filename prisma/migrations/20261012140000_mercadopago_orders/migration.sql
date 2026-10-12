-- AlterTable
ALTER TABLE "orders" ADD COLUMN "mercadopago_preference_id" TEXT;
ALTER TABLE "orders" ADD COLUMN "mercadopago_payment_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_mercadopago_preference_id_key" ON "orders"("mercadopago_preference_id");
