import { Suspense } from "react";
import RestablecerForm from "@/componentes/RestablecerForm";

export default function PaginaRestablecer() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 px-4 py-10">
      <Suspense fallback={<p className="text-sm text-cyber-cyan-200">Cargando…</p>}>
        <RestablecerForm />
      </Suspense>
    </main>
  );
}
