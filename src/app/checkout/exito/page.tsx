"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

function CheckoutExitoContenido() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const metodo = searchParams.get("metodo");
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const titulo =
    metodo === "efectivo"
      ? "¡Pedido confirmado!"
      : metodo === "transferencia"
        ? "¡Pedido registrado!"
        : "¡Pago exitoso!";

  const descripcion =
    metodo === "efectivo"
      ? "Tu pedido quedó reservado. Acercate al local para abonar en efectivo y retirar tus productos."
      : metodo === "transferencia"
        ? "Tu pedido fue registrado. Realizá la transferencia y enviá el comprobante a pagos@aurapro.com."
        : "Tu compra fue procesada correctamente. En breve verás el pedido en tu área de usuario.";

  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-3xl font-black text-cyber-lime-400">{titulo}</h1>
        <p className="mt-4 text-sm text-cyber-cyan-200/85">{descripcion}</p>
        {orderId && (
          <p className="mt-2 text-xs text-cyber-cyan-200/70">
            Número de pedido: <span className="font-mono text-cyber-cyan-300">{orderId}</span>
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/usuario"
            className="rounded-md bg-cyber-cyan-500 px-5 py-2 text-sm font-bold text-oscuro-950 hover:bg-cyber-cyan-400"
          >
            Ver mis compras
          </Link>
          <Link
            href="/productos"
            className="rounded-md border border-cyber-purple-500/40 px-5 py-2 text-sm font-semibold text-cyber-cyan-200 hover:bg-oscuro-800"
          >
            Seguir comprando
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function CheckoutExitoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-oscuro-950">
          <section className="mx-auto max-w-2xl px-4 py-12 text-center">
            <p className="text-sm text-cyber-cyan-200/80">Confirmando pago...</p>
          </section>
        </main>
      }
    >
      <CheckoutExitoContenido />
    </Suspense>
  );
}
