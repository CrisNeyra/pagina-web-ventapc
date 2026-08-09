import ProductosListado from "@/componentes/ProductosListado";
import { catalogoCompleto } from "@/datos/productos";

export default function ProductosPage() {
  return <ProductosListado productos={catalogoCompleto} titulo="Productos" />;
}
