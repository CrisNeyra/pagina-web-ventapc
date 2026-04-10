import EsqueletoProducto from "@/componentes/EsqueletoProducto";

export default function RootLoading() {
  return (
    <main className="flex-1 bg-oscuro-950">
      <section className="mx-auto my-10 max-w-7xl px-4">
        <div className="mb-5 h-8 w-64 animate-pulse rounded bg-oscuro-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <EsqueletoProducto key={idx} />
          ))}
        </div>
      </section>
    </main>
  );
}
