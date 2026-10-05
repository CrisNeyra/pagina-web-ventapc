"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiCheck, FiMapPin, FiShield, FiTruck } from "react-icons/fi";
import { calcularDescuento, formatearPrecio } from "@/utils/formato";
import { calcularCuota, calcularDescuentoTransferencia } from "@/lib/checkout";
import { useCartStore } from "@/store/cartStore";
import { verificarStockProducto } from "@/servicios/catalogoServicio";
import { toast } from "sonner";

export interface ProductDetailData {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  precioAnterior?: number;
  imagenes: string[];
  enStock: boolean;
  sku: string;
  stock?: number;
}

interface ProductDetailViewProps {
  producto: ProductDetailData;
}

const PLACEHOLDER = "/placeholder-producto.svg";
const CUOTAS_DESTACADAS = 6;

function extraerBullets(descripcion: string): string[] {
  const lineas = descripcion
    .split(/\n+/)
    .map((linea) => linea.trim())
    .filter(Boolean);

  if (lineas.length >= 2) return lineas.slice(0, 5);

  const frases = descripcion
    .split(/(?<=\.)\s+/)
    .map((frase) => frase.trim())
    .filter(Boolean);

  if (frases.length >= 2) return frases.slice(0, 5);

  const unica = descripcion.trim();
  return [
    ...(unica ? [unica] : []),
    "Garantía oficial de 12 meses",
    "Envíos a todo el país",
  ].slice(0, 5);
}

export default function ProductDetailView({ producto }: ProductDetailViewProps) {
  const router = useRouter();
  const imagenes = producto.imagenes.length > 0 ? producto.imagenes : [PLACEHOLDER];
  const [imagenSeleccionada, setImagenSeleccionada] = useState(imagenes[0]);
  const [imagenHover, setImagenHover] = useState<string | null>(null);
  const [indiceFallback, setIndiceFallback] = useState(0);
  const [tabActiva, setTabActiva] = useState<"especificaciones" | "preguntas">("especificaciones");
  const [cantidad, setCantidad] = useState(1);
  const [procesando, setProcesando] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const imagenVisible = imagenHover ?? imagenSeleccionada;
  const rutasFallback = [imagenVisible, PLACEHOLDER];
  const imagenActual = rutasFallback[indiceFallback] ?? PLACEHOLDER;

  const maxCantidad = useMemo(() => {
    if (!producto.enStock) return 1;
    if (typeof producto.stock === "number" && producto.stock > 0) {
      return Math.min(5, producto.stock);
    }
    return 1;
  }, [producto.enStock, producto.stock]);

  const descuento = useMemo(() => {
    if (!producto.precioAnterior) return null;
    return calcularDescuento(producto.precio, producto.precioAnterior);
  }, [producto.precio, producto.precioAnterior]);

  const cuotaDestacada = calcularCuota(producto.precio, CUOTAS_DESTACADAS);
  const ahorroTransferencia = calcularDescuentoTransferencia(producto.precio);
  const bullets = useMemo(() => extraerBullets(producto.descripcion), [producto.descripcion]);

  const especificacionesTienda: [string, string][] = [
    ["Categoría", producto.categoria],
    ["Garantía", "12 meses oficial"],
    ["Envío", "A todo el país"],
    ["Retiro", "Local CABA — Av. Corrientes 1234"],
  ];

  const preguntasFrecuentes = [
    "¿El producto incluye factura A o B? Sí, emitimos factura electrónica.",
    "¿Cuánto tarda el envío? Entre 24 y 96 horas hábiles según zona.",
    "¿Tiene garantía? Sí, cuenta con garantía oficial de 12 meses.",
  ];

  const productoCarrito = {
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    imagen: producto.imagenes[0] ?? PLACEHOLDER,
    enStock: producto.enStock,
  };

  const agregar = async (irCheckout: boolean) => {
    if (!producto.enStock) {
      toast.error("Este producto no tiene stock disponible.");
      return;
    }

    setProcesando(true);
    try {
      const hayStock = await verificarStockProducto(producto.id, cantidad);
      if (!hayStock) {
        toast.error("Este producto no tiene stock disponible.");
        return;
      }

      const agregado = addItem(productoCarrito, cantidad);
      if (!agregado) {
        toast.error("Este producto no tiene stock disponible.");
        return;
      }

      if (irCheckout) {
        router.push("/checkout");
        return;
      }
      toast.success(`${producto.nombre} agregado al carrito`);
    } finally {
      setProcesando(false);
    }
  };

  const miniatura = (imagen: string, indice: number) => (
    <button
      key={imagen}
      type="button"
      onClick={() => {
        setImagenSeleccionada(imagen);
        setImagenHover(null);
        setIndiceFallback(0);
      }}
      onMouseEnter={() => {
        setImagenHover(imagen);
        setIndiceFallback(0);
      }}
      onMouseLeave={() => setImagenHover(null)}
      aria-pressed={imagenSeleccionada === imagen}
      aria-label={`Foto ${indice + 1} de ${producto.nombre}`}
      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-oscuro-800 transition-all sm:h-16 sm:w-16 ${
        imagenSeleccionada === imagen
          ? "border-cyber-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.45)]"
          : "border-cyber-purple-500/30 hover:border-cyber-cyan-400/50"
      }`}
    >
      <Image src={imagen} alt={`Miniatura de ${producto.nombre}`} fill sizes="64px" className="object-contain p-1" />
    </button>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-cyber-cyan-200/70">
        <Link href="/" className="hover:text-cyber-cyan-300">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-cyber-cyan-300">
          Productos
        </Link>
        <span>/</span>
        <span className="text-cyber-cyan-200/85">{producto.categoria}</span>
        <span className="hidden sm:inline">/</span>
        <span className="hidden max-w-[12rem] truncate text-foreground/80 sm:inline">{producto.nombre}</span>
      </nav>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[72px_minmax(0,1fr)_340px]">
        <div className="hidden gap-2 overflow-x-auto lg:order-1 lg:flex lg:flex-col lg:overflow-visible">
          {imagenes.map((imagen, indice) => miniatura(imagen, indice))}
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative mb-3 aspect-[4/3] max-h-[280px] w-full overflow-hidden rounded-2xl border border-cyber-purple-500/30 bg-oscuro-800 sm:mb-4 sm:max-h-[380px] lg:mb-6 lg:aspect-square lg:max-h-[520px] lg:h-[480px]">
            <Image
              src={imagenActual}
              alt={producto.nombre}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="rounded-2xl object-contain p-4 sm:p-6"
              onError={() => {
                setIndiceFallback((previo) =>
                  previo < rutasFallback.length - 1 ? previo + 1 : previo
                );
              }}
            />
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {imagenes.map((imagen, indice) => miniatura(imagen, indice))}
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-ink-cyan">
            Nuevo · {producto.categoria}
          </p>
          <h1 className="mt-1 text-xl font-bold leading-tight text-foreground sm:text-2xl md:text-3xl">
            {producto.nombre}
          </h1>

          <div className="mt-3 sm:mt-4">
            {descuento !== null && producto.precioAnterior && (
              <p className="text-sm text-muted">
                <span className="line-through">{formatearPrecio(producto.precioAnterior)}</span>
                <span className="ml-2 font-mono font-bold text-ink-lime">-{descuento}%</span>
              </p>
            )}
            <p className="font-mono text-3xl font-black text-ink-cyan sm:text-4xl">{formatearPrecio(producto.precio)}</p>
            <p className="mt-1 text-sm text-ink/80">
              {CUOTAS_DESTACADAS} cuotas de {formatearPrecio(cuotaDestacada)} sin interés
            </p>
            <p className="mt-1 font-mono text-xs text-ink-lime">
              10% off con transferencia ({formatearPrecio(producto.precio - ahorroTransferencia)})
            </p>
          </div>
        </div>

        <aside className="order-2 lg:sticky lg:top-24 lg:order-3 lg:self-start">
          <div className="rounded-2xl border border-cyber-purple-500/40 bg-oscuro-900/90 p-4 shadow-[0_0_28px_rgba(109,40,217,0.18)] sm:p-5">
            <p className="hidden text-3xl font-black text-cyber-cyan-300 lg:block">
              {formatearPrecio(producto.precio)}
            </p>
            <p className="mt-1 hidden text-xs text-cyber-cyan-100/75 lg:block">
              {CUOTAS_DESTACADAS} cuotas de {formatearPrecio(cuotaDestacada)}
            </p>

            <div className="space-y-3 text-sm text-cyber-cyan-100/90 lg:mt-5">
              <p className="flex items-start gap-2">
                <FiTruck className="mt-0.5 shrink-0 text-ink-lime" />
                <span>
                  <strong className="text-ink-lime">Envíos a todo el país</strong>
                  <span className="block text-xs text-cyber-cyan-200/70">
                    24 a 96 horas hábiles según zona
                  </span>
                </span>
              </p>
              <p className="flex items-start gap-2">
                <FiMapPin className="mt-0.5 shrink-0 text-cyber-cyan-400" />
                <span>
                  Retiro en local (CABA)
                  <span className="block text-xs text-cyber-cyan-200/70">
                    Av. Corrientes 1234 · Lun a Sáb 10 a 19 hs
                  </span>
                </span>
              </p>
              <p className="flex items-center gap-2">
                <FiCheck className={producto.enStock ? "text-ink-lime" : "text-ink-magenta"} />
                {producto.enStock
                  ? typeof producto.stock === "number"
                    ? `Stock disponible (${producto.stock} unidades)`
                    : "Stock disponible"
                  : "Sin stock"}
              </p>
              <p className="flex items-center gap-2">
                <FiShield className="text-cyber-cyan-400" />
                Garantía oficial de 12 meses
              </p>
            </div>

            <label className="mt-5 block text-sm text-cyber-cyan-100">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-cyber-cyan-300/80">
                Cantidad
              </span>
              <select
                value={cantidad}
                disabled={!producto.enStock}
                onChange={(evento) => setCantidad(Number(evento.target.value))}
                className="min-h-11 w-full rounded-md border border-cyber-purple-500/35 bg-oscuro-800 px-3 py-2 text-sm text-foreground disabled:opacity-50"
              >
                {Array.from({ length: maxCantidad }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} unidad{n > 1 ? "es" : ""}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              disabled={!producto.enStock || procesando}
              onClick={() => void agregar(true)}
              className="mt-4 min-h-12 w-full rounded-md bg-ink-cyan px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-ink-violet disabled:cursor-not-allowed disabled:opacity-50"
            >
              {procesando ? "Procesando..." : "Comprar ahora"}
            </button>
            <button
              type="button"
              disabled={!producto.enStock || procesando}
              onClick={() => void agregar(false)}
              className="btn-cyber-outline mt-2 min-h-12 w-full rounded-md px-4 py-3 text-sm disabled:opacity-50"
            >
              Agregar al carrito
            </button>

            <p className="mt-4 font-mono text-[11px] text-muted">SKU: {producto.sku}</p>
          </div>
        </aside>

        <div className="order-3 lg:order-4 lg:col-span-2 lg:col-start-2">
          <div className="mt-2 lg:mt-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-cyber-cyan-300">
              Lo que tenés que saber de este producto
            </h2>
            <ul className="space-y-2 text-sm text-cyber-cyan-100/90">
              {bullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyber-cyan-400" />
                  <span className="whitespace-pre-line">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-2xl border border-cyber-purple-500/30 bg-oscuro-900/80 p-4 md:p-6">
            <div className="mb-4 flex gap-2 overflow-x-auto border-b border-cyber-purple-500/25 pb-3">
              <button
                type="button"
                onClick={() => setTabActiva("especificaciones")}
                className={`min-h-11 shrink-0 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide ${
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
                className={`min-h-11 shrink-0 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide ${
                  tabActiva === "preguntas"
                    ? "bg-cyber-purple-500/20 text-cyber-cyan-200"
                    : "text-cyber-cyan-300/70"
                }`}
              >
                Preguntas
              </button>
            </div>

            {tabActiva === "especificaciones" ? (
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-cyber-cyan-300/60">
                  Datos de tienda
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  {especificacionesTienda.map(([clave, valor]) => (
                    <div
                      key={clave}
                      className="flex items-center justify-between gap-3 rounded-md border border-cyber-purple-500/20 bg-oscuro-800/75 px-3 py-2 text-sm"
                    >
                      <span className="text-cyber-cyan-100/75">{clave}</span>
                      <span className="text-right font-semibold text-cyber-cyan-100">{valor}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {preguntasFrecuentes.map((pregunta) => (
                  <li
                    key={pregunta}
                    className="rounded-md bg-oscuro-800/70 px-3 py-2 text-sm text-cyber-cyan-100"
                  >
                    {pregunta}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
