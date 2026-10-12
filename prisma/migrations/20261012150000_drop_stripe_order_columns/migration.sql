DROP INDEX IF EXISTS "orders_stripe_payment_intent_id_key";

ALTER TABLE "orders" DROP COLUMN IF EXISTS "stripe_amount_cents";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "stripe_payment_intent_id";
