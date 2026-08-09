import ProductosListado from "@/componentes/ProductosListado";
import { catalogoCompleto } from "@/datos/productos";
import { filtrarProductosNotebooks } from "@/utils/productos";

const notebooks = filtrarProductosNotebooks(catalogoCompleto);

export default function NotebooksPage() {
  return (
    <ProductosListado
      productos={notebooks}
      titulo="Notebooks"
      mensajeVacio="No se encontraron notebooks."
    />
  );
}
