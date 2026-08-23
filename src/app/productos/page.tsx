import ProductosListado from "@/componentes/ProductosListado";
import { obtenerCatalogo } from "@/servicios/catalogoServicio";

export const revalidate = 60;

export default async function ProductosPage() {
  const productos = await obtenerCatalogo();
  return <ProductosListado productos={productos} titulo="Productos" />;
}
