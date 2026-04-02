import ProductSkeleton from "@/componentes/ProductSkeleton";

export default function NotebooksLoading() {
  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-5 h-9 w-56 animate-pulse rounded bg-oscuro-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <ProductSkeleton key={idx} />
          ))}
        </div>
      </section>
    </main>
  );
}
