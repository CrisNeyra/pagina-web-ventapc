import AdminPanel from "@/componentes/AdminPanel";

export const metadata = {
  title: "Administración | Aura Pro",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-5xl px-4 py-8">
        <AdminPanel />
      </section>
    </main>
  );
}
