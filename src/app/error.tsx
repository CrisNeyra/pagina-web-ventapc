"use client";

interface PaginaErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PaginaError({ error, reset }: PaginaErrorProps) {
  console.error("Error de aplicación:", error);

  return (
    <main className="min-h-screen bg-oscuro-950 px-4 py-16">
      <section className="mx-auto max-w-xl rounded-2xl border border-cyber-pink-500/35 bg-oscuro-900/85 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyber-pink-400">
          Error inesperado
        </p>
        <h1 className="mt-2 text-2xl font-black text-white">
          Ocurrió un problema al cargar la página
        </h1>
        <p className="mt-3 text-sm text-cyber-cyan-200/85">
          Reintentá la operación. Si persiste, revisá la conexión y configuración de
          Supabase.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-cyber-cyan-500 px-5 py-2.5 text-sm font-bold text-oscuro-950 hover:bg-cyber-cyan-400"
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}
