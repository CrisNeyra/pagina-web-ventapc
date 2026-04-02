import ProductCard from "@/componentes/ProductCard";
import { productosDestacados, productosRebajados } from "@/datos/productos";

const todos = [...productosDestacados, ...productosRebajados];

export default function ProductosPage() {
  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-5 text-3xl font-black text-white">Productos</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {todos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      </section>
    </main>
  );
}
