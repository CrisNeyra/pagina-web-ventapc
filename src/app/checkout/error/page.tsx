"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CheckoutErrorContenido() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-3xl font-black text-cyber-pink-400">No se pudo completar el pago</h1>
        <p className="mt-4 text-sm text-cyber-cyan-200/85">
          Mercado Pago no acreditó el cobro. Podés volver al checkout e intentar de nuevo, o elegir
          efectivo / transferencia. Si ves un cargo pendiente en la tarjeta, esperá unos minutos o
          escribinos por WhatsApp.
        </p>
        {orderId && (
          <p className="mt-2 text-xs text-cyber-cyan-200/70">
            Pedido: <span className="font-mono text-cyber-cyan-300">{orderId}</span>
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/checkout"
            className="rounded-md bg-cyber-cyan-500 px-5 py-2 text-sm font-bold text-white hover:bg-cyber-cyan-400"
          >
            Reintentar checkout
          </Link>
          <Link
            href="/ayuda"
            className="rounded-md border border-cyber-purple-500/40 px-5 py-2 text-sm font-semibold text-cyber-cyan-200 hover:bg-oscuro-800"
          >
            Ir a ayuda
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function CheckoutErrorPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-oscuro-950">
          <section className="mx-auto max-w-2xl px-4 py-12 text-center">
            <p className="text-sm text-cyber-cyan-200/80">Cargando...</p>
          </section>
        </main>
      }
    >
      <CheckoutErrorContenido />
    </Suspense>
  );
}
