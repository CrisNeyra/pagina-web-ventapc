import TrabajaConNosotrosForm from "@/componentes/TrabajaConNosotrosForm";

export const metadata = {
  title: "Trabajá con nosotros | Aura Pro",
  description: "Sumate al equipo de Aura Pro. Enviá tu CV y postulate.",
};

export default function TrabajaConNosotrosPage() {
  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-black text-white">Trabajá con nosotros</h1>
        <p className="mt-3 text-sm text-cyber-cyan-200/80">
          ¿Te apasiona el hardware gamer? Completá el formulario y adjuntá tu CV en PDF.
          Nuestro equipo de RRHH revisará tu postulación.
        </p>

        <div className="mt-8 rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-6">
          <TrabajaConNosotrosForm />
        </div>
      </section>
    </main>
  );
}
