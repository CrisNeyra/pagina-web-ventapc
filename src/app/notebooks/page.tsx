import ProductosListado from "@/componentes/ProductosListado";
import { obtenerCatalogo } from "@/servicios/catalogoServicio";
import { filtrarProductosNotebooks } from "@/utils/productos";

export const revalidate = 60;

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
