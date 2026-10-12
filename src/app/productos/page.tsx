import type { Metadata } from "next";
import ProductosListado from "@/componentes/ProductosListado";
import { obtenerCatalogo } from "@/servicios/catalogoServicio";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Catálogo Aura Pro: componentes de PC, periféricos y notebooks con stock en Argentina.",
};

export default async function ProductosPage() {
  const productos = await obtenerCatalogo();
  return <ProductosListado productos={productos} titulo="Productos" />;
}
