export default function AyudaPage() {
  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-4 text-3xl font-black text-white">Centro de Ayuda</h1>
        <div className="space-y-3 rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-5">
          <p className="text-cyber-cyan-200/85">
            Si necesitás soporte, escribinos por WhatsApp o iniciá sesión para
            guardar y continuar tu armado de PC.
          </p>
          <p className="text-sm text-cyber-cyan-200/75">
            Horario de atención: Lun a Vie de 9:00 a 18:00.
          </p>
        </div>
      </section>
    </main>
  );
}
