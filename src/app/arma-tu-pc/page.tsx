import type { Metadata } from "next";
import Image from "next/image";
import PcBuilder from "@/componentes/PcBuilder";
import { productosBuilderDesdeCatalogo } from "@/datos/pcBuilder";
import { obtenerCatalogo } from "@/servicios/catalogoServicio";

export const metadata: Metadata = {
  title: "Armá tu PC",
  description:
    "Armá una PC compatible eligiendo componentes. Aura Pro valida sockets, RAM y fuentes.",
};

export default async function ArmaTuPcPage() {
  const catalogo = await obtenerCatalogo();
  const productos = productosBuilderDesdeCatalogo(catalogo);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-oscuro-950">
      <Image
        src="/videos/habitacion-ciberpunk-con-pc-gamer-poster.jpg"
        alt=""
        fill
        aria-hidden
        sizes="100vw"
        className="pointer-events-none object-cover opacity-90 blur-[2px]"
      />
      <div className="pointer-events-none absolute inset-0 bg-oscuro-950/55" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(74,0,224,0.18),transparent_42%),radial-gradient(circle_at_85%_8%,rgba(0,122,140,0.16),transparent_36%)]"
        aria-hidden
      />
      <div className="relative">
        <PcBuilder productos={productos} />
      </div>
    </main>
  );
}
