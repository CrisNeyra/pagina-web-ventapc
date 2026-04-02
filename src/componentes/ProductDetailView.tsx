"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FiCheck, FiCreditCard, FiHelpCircle, FiShield, FiTruck } from "react-icons/fi";
import { calcularDescuento, formatearPrecio } from "@/utils/formato";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

export interface ProductDetailData {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  precioAnterior?: number;
  imagen: string;
  enStock: boolean;
  galeria: string[];
  sku: string;
}

interface ProductDetailViewProps {
  producto: ProductDetailData;
}

const especificaciones = [
  ["Categoría", "Periféricos / Componentes"],
  ["Conectividad", "USB / Inalámbrica según versión"],
  ["Materiales", "Plástico reforzado y aluminio"],
  ["Compatibilidad", "Windows / Linux"],
  ["Garantía", "12 meses oficial"],
  ["Envío", "A todo el país"],
];

const preguntasFrecuentes = [
  "¿El producto incluye factura A o B? Sí, emitimos factura electrónica.",
  "¿Cuánto tarda el envío? Entre 24 y 96 horas hábiles según zona.",
  "¿Tiene garantía? Sí, cuenta con garantía oficial de 12 meses.",
];

export default function ProductDetailView({ producto }: ProductDetailViewProps) {
  const [imagenActiva, setImagenActiva] = useState(producto.galeria[0] ?? producto.imagen);
  const [tabActiva, setTabActiva] = useState<"especificaciones" | "preguntas">("especificaciones");
  const addItem = useCartStore((state) => state.addItem);

  const descuento = useMemo(() => {
    if (!producto.precioAnterior) return null;
    return calcularDescuento(producto.precio, producto.precioAnterior);
  }, [producto.precio, producto.precioAnterior]);

  const agregarAlCarrito = () => {
    if (!producto.enStock) {
      toast.error("Este producto no tiene stock disponible.");
      return;
    }
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      enStock: producto.enStock,
    });
    toast.success(`✅ ${producto.nombre} agregado al carrito`);
  };

  return (
    <section className="mx-auto my-8 max-w-7xl px-4">
      <div className="rounded-2xl border border-cyber-purple-500/30 bg-oscuro-900/85 p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="relative mb-4 h-[320px] rounded-xl border border-cyber-cyan-500/25 bg-oscuro-800 md:h-[400px]">
              <Image
                src={imagenActiva}
                alt={producto.nombre}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-contain p-4"
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              {producto.galeria.map((imagen) => (
                <button
                  key={imagen}
                  onClick={() => setImagenActiva(imagen)}
                  className={`relative h-20 overflow-hidden rounded-lg border transition-all duration-200 ${
                    imagenActiva === imagen
                      ? "border-cyber-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.45)]"
                      : "border-cyber-purple-500/25"
                  }`}
                  aria-label="Seleccionar imagen del producto"
                >
                  <Image src={imagen} alt={producto.nombre} fill sizes="100px" className="object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyber-cyan-300/85">
              {producto.categoria}
            </p>
            <h1 className="text-2xl font-bold leading-tight text-white md:text-3xl">{producto.nombre}</h1>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border border-cyber-purple-500/30 bg-oscuro-800 px-2 py-1 text-cyber-cyan-200">
                SKU: {producto.sku}
              </span>
              <span className="rounded-md border border-cyber-purple-500/30 bg-oscuro-800 px-2 py-1 text-cyber-cyan-200">
                ID: {producto.id}
              </span>
            </div>

            <article className="mt-5 rounded-xl border border-cyber-purple-500/30 bg-oscuro-800/90 p-4">
              {descuento !== null && producto.precioAnterior && (
                <p className="mb-2 text-xs text-gray-400">
                  Antes:{" "}
                  <span className="line-through">{formatearPrecio(producto.precioAnterior)}</span>{" "}
                  <span className="ml-1 font-bold text-cyber-lime-400">-{descuento}%</span>
                </p>
              )}

              <p className="text-4xl font-black text-cyber-cyan-300">{formatearPrecio(producto.precio)}</p>
              <p className="mt-1 text-sm text-cyber-cyan-100/80">Incluye IVA y descuento en transferencia.</p>

              <div className="mt-4 rounded-lg border border-cyber-purple-500/30 bg-oscuro-900 p-3">
                <div className="flex items-center justify-between text-sm text-cyber-cyan-100">
                  <span className="flex items-center gap-2">
                    <FiCreditCard />
                    Hasta 6 cuotas sin interés
                  </span>
                  <span className="font-semibold">Ver cuotas</span>
                </div>
              </div>
            </article>

            <div className="mt-5 space-y-2 text-sm text-cyber-cyan-100/85">
              <p className="flex items-center gap-2">
                <FiCheck className={producto.enStock ? "text-cyber-lime-400" : "text-cyber-pink-400"} />
                {producto.enStock ? "Stock disponible" : "Sin stock"}
              </p>
              <p className="flex items-center gap-2">
                <FiShield className="text-cyber-cyan-400" />
                Garantía oficial de 12 meses
              </p>
              <p className="flex items-center gap-2">
                <FiTruck className="text-cyber-cyan-400" />
                Envíos a todo el país
              </p>
            </div>

            <button
              className="mt-6 inline-flex items-center rounded-md border border-cyber-cyan-400 bg-cyber-cyan-500/10 px-6 py-3 text-sm font-bold uppercase tracking-wide text-cyber-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.3)] transition-all duration-200 hover:bg-cyber-cyan-400 hover:text-oscuro-950"
              type="button"
              onClick={agregarAlCarrito}
            >
              Sumar al carrito
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-cyber-purple-500/30 bg-oscuro-900/80 p-4 md:p-6">
        <div className="mb-4 flex gap-2 border-b border-cyber-purple-500/25 pb-3">
          <button
            type="button"
            onClick={() => setTabActiva("especificaciones")}
            className={`rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide ${
              tabActiva === "especificaciones"
                ? "bg-cyber-purple-500/20 text-cyber-cyan-200"
                : "text-cyber-cyan-300/70"
            }`}
          >
            Especificaciones
          </button>
          <button
            type="button"
            onClick={() => setTabActiva("preguntas")}
            className={`rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide ${
              tabActiva === "preguntas" ? "bg-cyber-purple-500/20 text-cyber-cyan-200" : "text-cyber-cyan-300/70"
            }`}
          >
            Preguntas
          </button>
        </div>

        {tabActiva === "especificaciones" ? (
          <div className="grid gap-2 md:grid-cols-2">
            {especificaciones.map(([clave, valor]) => (
              <div
                key={clave}
                className="flex items-center justify-between rounded-md border border-cyber-purple-500/20 bg-oscuro-800/75 px-3 py-2 text-sm"
              >
                <span className="text-cyber-cyan-100/75">{clave}</span>
                <span className="font-semibold text-cyber-cyan-100">{valor}</span>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {preguntasFrecuentes.map((pregunta) => (
              <li key={pregunta} className="flex gap-2 rounded-md bg-oscuro-800/70 px-3 py-2 text-sm text-cyber-cyan-100">
                <FiHelpCircle className="mt-0.5 shrink-0 text-cyber-cyan-300" />
                <span>{pregunta}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="mt-6 rounded-2xl border border-cyber-purple-500/30 bg-oscuro-900/85 px-4 py-5">
        <div className="grid gap-4 text-sm text-cyber-cyan-100/85 md:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-cyber-cyan-300">Pagos</p>
            <p>Transferencia, tarjetas de crédito y débito, cuotas sin interés.</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-cyber-cyan-300">Redes</p>
            <p>Seguinos en Instagram, YouTube, TikTok y LinkedIn.</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-cyber-cyan-300">Soporte</p>
            <p>Ayuda, garantía, envíos y términos y condiciones.</p>
          </div>
        </div>
      </footer>
    </section>
  );
}
