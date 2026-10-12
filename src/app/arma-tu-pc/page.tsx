import type { Metadata } from "next";
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
    <main className="min-h-screen bg-oscuro-950">
      <PcBuilder productos={productos} />
    </main>
  );
}
