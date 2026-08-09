import Link from "next/link";

export default function CheckoutErrorPage() {
  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-3xl font-black text-cyber-pink-400">No se pudo completar el pago</h1>
        <p className="mt-4 text-sm text-cyber-cyan-200/85">
          Hubo un problema al procesar tu compra. Podés volver al checkout e intentar nuevamente,
          o contactar soporte si el cargo apareció en tu tarjeta.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/checkout"
            className="rounded-md bg-cyber-cyan-500 px-5 py-2 text-sm font-bold text-oscuro-950 hover:bg-cyber-cyan-400"
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
