import PcBuilder from "@/componentes/PcBuilder";
import { productosBuilderDesdeCatalogo } from "@/datos/pcBuilder";
import { obtenerCatalogo } from "@/servicios/catalogoServicio";

export default async function ArmaTuPcPage() {
  const catalogo = await obtenerCatalogo();
  const productos = productosBuilderDesdeCatalogo(catalogo);

  return (
    <main className="min-h-screen bg-oscuro-950">
      <PcBuilder productos={productos} />
    </main>
  );
}
