import type { Metadata } from "next";
import ProductosListado from "@/componentes/ProductosListado";
import { obtenerCatalogo } from "@/servicios/catalogoServicio";
import { filtrarProductosNotebooks } from "@/utils/productos";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Notebooks",
  description: "Notebooks gamer y de trabajo en Aura Pro. Envíos a todo el país.",
};

export default async function NotebooksPage() {
  const catalogo = await obtenerCatalogo();
  const notebooks = filtrarProductosNotebooks(catalogo);

  return (
    <ProductosListado
      productos={notebooks}
      titulo="Notebooks"
      mensajeVacio="No se encontraron notebooks."
    />
  );
}
