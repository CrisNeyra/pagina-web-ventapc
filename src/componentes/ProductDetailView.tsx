"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiCheck, FiMapPin, FiShield, FiStar, FiTruck } from "react-icons/fi";
import { calcularDescuento, formatearPrecio } from "@/utils/formato";
import { calcularCuota, calcularDescuentoTransferencia } from "@/lib/checkout";
import { filasSpecsTecnicas } from "@/lib/specs-producto";
import type { EspecificacionPc } from "@/datos/especificacionesPc";
import ProductImageGallery from "@/componentes/producto/ProductImageGallery";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/context/AuthContext";
import { pedirInicioSesion } from "@/lib/pedir-sesion";
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
  specs?: EspecificacionPc | null;
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

  if (lineas.length >= 2) return lineas.slice(0, 8);

  const frases = descripcion
    .split(/(?<=\.)\s+/)
    .map((frase) => frase.trim())
    .filter(Boolean);

  if (frases.length >= 2) return frases.slice(0, 8);

  const unica = descripcion.trim();
  return [
    ...(unica ? [unica] : []),
    "Garantía oficial de 12 meses",
    "Envíos a todo el país",
  ].slice(0, 8);
}

export default function ProductDetailView({ producto }: ProductDetailViewProps) {
  const router = useRouter();
  const [cantidad, setCantidad] = useState(1);
  const [procesando, setProcesando] = useState(false);
  const { user } = useAuth();
  const addItem = useCartStore((state) => state.addItem);

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

  const filasTecnicas = useMemo(() => filasSpecsTecnicas(producto.specs), [producto.specs]);

  const especificacionesTienda: { clave: string; valor: string }[] = [
    { clave: "Categoría", valor: producto.categoria },
    { clave: "SKU", valor: producto.sku },
    { clave: "Garantía", valor: "12 meses oficial" },
    { clave: "Envío", valor: "A todo el país (24–96 h hábiles)" },
    { clave: "Retiro", valor: "CABA — Av. Corrientes 1234" },
    ...filasTecnicas,
  ];

  const productoCarrito = {
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    imagen: producto.imagenes[0] ?? PLACEHOLDER,
    enStock: producto.enStock,
  };

  const agregar = async (irCheckout: boolean) => {
    if (!user) {
      pedirInicioSesion();
      return;
    }
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

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-cyber-cyan-200/70">
        <Link href="/" className="hover:text-cyber-cyan-300">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-cyber-cyan-300">
          Productos
        </Link>
        <span>/</span>
        <span className="text-cyber-cyan-200/85">{producto.categoria}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,380px)] lg:items-start">
        <div className="min-w-0">
          <ProductImageGallery nombre={producto.nombre} imagenes={producto.imagenes} />
        </div>

        <aside className="rounded-2xl border border-oscuro-700 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
          <p className="text-xs font-medium text-muted">Nuevo | +50 vendidos</p>
          <h1 className="mt-1 text-xl font-normal leading-snug text-foreground sm:text-2xl">
            {producto.nombre}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-oscuro-900/5 px-2 py-1 font-semibold text-foreground">
              <FiStar className="text-amber-500" aria-hidden />
              4.8 · Tienda oficial Aura Pro
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold ${
                producto.enStock
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <FiCheck aria-hidden />
              {producto.enStock
                ? typeof producto.stock === "number"
                  ? `Stock (${producto.stock})`
                  : "Stock disponible"
                : "Sin stock"}
            </span>
          </div>

          <div className="mt-5 border-t border-oscuro-700/40 pt-4">
            {descuento !== null && producto.precioAnterior && (
              <p className="text-sm text-muted">
                <span className="line-through">{formatearPrecio(producto.precioAnterior)}</span>
                <span className="ml-2 font-bold text-emerald-600">-{descuento}% OFF</span>
              </p>
            )}
            <p className="font-mono text-4xl font-light tracking-tight text-foreground">
              {formatearPrecio(producto.precio)}
            </p>
            <p className="mt-2 text-sm text-foreground/80">
              en {CUOTAS_DESTACADAS} cuotas de{" "}
              <strong>{formatearPrecio(cuotaDestacada)}</strong> sin interés
            </p>
            <p className="mt-1 text-xs text-muted">
              10% off transferencia ({formatearPrecio(producto.precio - ahorroTransferencia)})
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-oscuro-700/30 bg-oscuro-900/[0.03] px-3 py-2 text-xs text-foreground/85">
            <p className="font-semibold text-foreground">Medios de pago</p>
            <p className="mt-1">
              Tarjetas de crédito y débito, Mercado Pago Checkout Pro y transferencia bancaria.
            </p>
          </div>

          <div className="mt-4 space-y-2 text-sm text-foreground/85">
            <p className="flex items-start gap-2">
              <FiTruck className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
              <span>
                <strong>Envío a todo el país</strong>
                <span className="block text-xs text-muted">Entre 24 y 96 horas hábiles</span>
              </span>
            </p>
            <p className="flex items-start gap-2">
              <FiMapPin className="mt-0.5 shrink-0 text-ink-cyan" aria-hidden />
              <span>
                Retiro gratis en CABA
                <span className="block text-xs text-muted">Av. Corrientes 1234</span>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <FiShield className="shrink-0 text-ink-cyan" aria-hidden />
              Garantía oficial 12 meses
            </p>
          </div>

          <label className="mt-5 block text-sm">
            <span className="mb-1 block text-xs font-semibold text-muted">Cantidad</span>
            <select
              value={cantidad}
              disabled={!producto.enStock}
              onChange={(evento) => setCantidad(Number(evento.target.value))}
              className="min-h-11 w-full rounded-md border border-oscuro-700 bg-white px-3 py-2 text-sm disabled:opacity-50"
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
            className="mt-4 min-h-12 w-full rounded-md bg-[#3483fa] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2968c8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {procesando ? "Procesando..." : "Comprar ahora"}
          </button>
          <button
            type="button"
            disabled={!producto.enStock || procesando}
            onClick={() => void agregar(false)}
            className="mt-2 min-h-12 w-full rounded-md border border-[#3483fa]/40 bg-white px-4 py-3 text-sm font-semibold text-[#3483fa] transition-colors hover:bg-[#3483fa]/5 disabled:opacity-50"
          >
            Agregar al carrito
          </button>
        </aside>
      </div>

      <div className="mt-10 space-y-8 border-t border-oscuro-700/30 pt-8">
        <section aria-labelledby="descripcion-producto">
          <h2 id="descripcion-producto" className="text-lg font-semibold text-foreground">
            Descripción
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {producto.descripcion}
          </p>
          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
            Lo más destacado
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-foreground/90">
            {bullets.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-cyan" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="especificaciones-producto">
          <h2 id="especificaciones-producto" className="text-lg font-semibold text-foreground">
            Características principales
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-oscuro-700/40">
            <table className="w-full text-left text-sm">
              <tbody>
                {especificacionesTienda.map((fila, i) => (
                  <tr
                    key={fila.clave}
                    className={i % 2 === 0 ? "bg-oscuro-900/[0.04]" : "bg-white"}
                  >
                    <th scope="row" className="w-[42%] px-4 py-3 font-normal text-muted">
                      {fila.clave}
                    </th>
                    <td className="px-4 py-3 font-medium text-foreground">{fila.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
