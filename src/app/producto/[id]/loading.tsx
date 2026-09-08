export default function ProductoLoading() {
  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 h-3 w-64 animate-pulse rounded bg-oscuro-800" />
        <div className="grid gap-6 lg:grid-cols-[72px_minmax(0,1fr)_340px]">
          <div className="flex gap-2 lg:flex-col">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 w-16 animate-pulse rounded-lg bg-oscuro-800" />
            ))}
          </div>
          <div>
            <div className="aspect-square w-full max-h-[480px] animate-pulse rounded-2xl bg-oscuro-800" />
            <div className="mt-6 h-8 w-3/4 animate-pulse rounded bg-oscuro-800" />
            <div className="mt-3 h-10 w-40 animate-pulse rounded bg-oscuro-800" />
            <div className="mt-8 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-oscuro-800" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-oscuro-800" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-oscuro-800" />
            </div>
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-oscuro-800" />
        </div>
      </section>
    </main>
  );
}
