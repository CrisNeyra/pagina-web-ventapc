"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FiBox,
  FiCheck,
  FiCpu,
  FiGrid,
  FiHardDrive,
  FiMonitor,
  FiServer,
  FiWind,
  FiX,
  FiZap,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { builderCategories, builderProducts } from "@/datos/pcBuilder";
import {
  especificacionesPc,
  type EspecificacionPc,
} from "@/datos/especificacionesPc";
import { choquesDeSeleccion, motivoIncompatibilidad } from "@/lib/compatibilidadPc";
import { formatearPrecio } from "@/utils/formato";
import { calcularSubtotalBuilder, useBuilderStore } from "@/store/builderStore";
import { guardarBuildConReintentos } from "@/servicios/buildsPcServicio";
import { useAuth } from "@/context/AuthContext";
import { pedirInicioSesion } from "@/lib/pedir-sesion";
import { useCartStore } from "@/store/cartStore";
import type { BuilderCategoryId, BuilderProduct } from "@/tipos/pcBuilder";

const ICONO_CATEGORIA: Record<BuilderCategoryId, IconType> = {
  procesador: FiCpu,
  motherboard: FiGrid,
  cooler: FiWind,
  ram: FiServer,
  gpu: FiMonitor,
  almacenamiento: FiHardDrive,
  fuente: FiZap,
  gabinete: FiBox,
};

function specsDe(producto: BuilderProduct): EspecificacionPc {
  return producto.specs ?? especificacionesPc[producto.id] ?? {};
}

function chipsDefinidos(chips: ReadonlyArray<string | undefined>): string[] {
  const salida: string[] = [];
  for (const chip of chips) {
    if (chip) salida.push(chip);
  }
  return salida;
}

function chipsDeProducto(producto: BuilderProduct): string[] {
  const specs = specsDe(producto);
  switch (producto.categoria) {
    case "procesador":
      return chipsDefinidos([
        specs.socket,
        specs.tdp != null ? `${specs.tdp} W` : undefined,
      ]);
    case "motherboard":
      return chipsDefinidos([specs.socket, specs.ddr, specs.factor]);
    case "cooler":
      return specs.socketsCooler ?? [];
    case "ram":
      return specs.ddr ? [specs.ddr] : [];
    case "gpu":
      return specs.consumoGpu != null ? [`${specs.consumoGpu} W`] : [];
    case "fuente":
      return specs.watts != null ? [`${specs.watts} W`] : [];
    case "gabinete":
      return specs.factoresGabinete ?? [];
    default:
      return [];
  }
}

function siguienteCategoriaVacia(
  desde: BuilderCategoryId,
  seleccion: Partial<Record<BuilderCategoryId, BuilderProduct>>
): BuilderCategoryId | null {
  const indice = builderCategories.findIndex((categoria) => categoria.id === desde);
  const orden = [
    ...builderCategories.slice(indice + 1),
    ...builderCategories.slice(0, indice),
  ];
  return orden.find((categoria) => !seleccion[categoria.id])?.id ?? null;
}

export default function PcBuilder({
  productos = builderProducts,
}: {
  productos?: typeof builderProducts;
}) {
  const {
    categoriaActiva,
    seleccion,
    setCategoriaActiva,
    seleccionarProducto,
    quitarProducto,
    limpiarBuild,
  } = useBuilderStore();
  const { user } = useAuth();
  const addItem = useCartStore((estado) => estado.addItem);
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [imagenesConError, setImagenesConError] = useState<Record<string, true>>({});

  const productosCategoria = useMemo(
    () =>
      productos.filter((producto) => producto.categoria === categoriaActiva),
    [categoriaActiva, productos]
  );

  const subtotal = useMemo(() => calcularSubtotalBuilder(seleccion), [seleccion]);
  const categoriasCompletadas = useMemo(
    () => builderCategories.filter((categoria) => Boolean(seleccion[categoria.id])).length,
    [seleccion]
  );
  const faltan = builderCategories.length - categoriasCompletadas;
  const categoriaActivaMeta = useMemo(
    () => builderCategories.find((cat) => cat.id === categoriaActiva),
    [categoriaActiva]
  );
  const choques = useMemo(() => choquesDeSeleccion(seleccion), [seleccion]);
  const sinPiezas = categoriasCompletadas === 0;

  const agregarProducto = (producto: BuilderProduct) => {
    seleccionarProducto(producto);
    const siguiente = siguienteCategoriaVacia(producto.categoria, {
      ...seleccion,
      [producto.categoria]: producto,
    });
    if (siguiente) setCategoriaActiva(siguiente);
  };

  const irAlCheckout = () => {
    if (!user) {
      pedirInicioSesion();
      return;
    }
    for (const categoria of builderCategories) {
      const pieza = seleccion[categoria.id];
      if (!pieza) continue;
      addItem({
        id: pieza.id,
        nombre: pieza.nombre,
        precio: pieza.precio,
        imagen: pieza.imagen,
        enStock: pieza.stock,
      });
    }
    router.push("/checkout");
  };

  const guardarConfiguracion = async () => {
    setFeedback("");

    if (!user) {
      setFeedback("Inicia sesion para guardar esta configuracion.");
      return;
    }

    const itemsSeleccionados = builderCategories
      .map((cat) => seleccion[cat.id])
      .filter(Boolean)
      .map((item) => ({
        id: item!.id,
        nombre: item!.nombre,
        precio: item!.precio,
        categoria: item!.categoria,
      }));

    if (itemsSeleccionados.length === 0) {
      setFeedback("Primero seleccioná al menos un componente.");
      return;
    }

    setGuardando(true);
    const resultado = await guardarBuildConReintentos({
      user_id: user.uid,
      subtotal,
      items: itemsSeleccionados,
    });
    setGuardando(false);
    setFeedback(resultado.mensaje);
  };

  const marcarImagenConError = (clave: string) => {
    setImagenesConError((previo) => {
      if (previo[clave]) return previo;
      return { ...previo, [clave]: true };
    });
  };

  const textoFaltan =
    faltan === 1
      ? "Falta 1 pieza. Podés seguir igual."
      : `Faltan ${faltan} piezas. Podés seguir igual.`;

  return (
    <section className="mx-auto my-8 max-w-7xl px-4">
      <header className="mb-4 rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-foreground">Armá tu PC</h1>
            <p className="mt-1 text-xs text-cyber-cyan-200/80">
              Elegí una categoría y sumá cada pieza. El total se actualiza al instante.
            </p>
          </div>
          <p className="text-sm font-black text-cyber-cyan-300">
            {categoriasCompletadas}/{builderCategories.length}
          </p>
        </div>
        <div
          className="flex gap-1"
          role="progressbar"
          aria-valuenow={categoriasCompletadas}
          aria-valuemin={0}
          aria-valuemax={builderCategories.length}
          aria-label="Piezas elegidas"
        >
          {builderCategories.map((categoria) => {
            const completa = Boolean(seleccion[categoria.id]);
            const activa = categoriaActiva === categoria.id;
            return (
              <span
                key={categoria.id}
                title={categoria.nombre}
                className={`h-2 flex-1 rounded-full ${
                  completa ? "bg-cyber-cyan-400" : "bg-cyber-purple-500/35"
                } ${activa ? "ring-2 ring-cyber-cyan-200 ring-offset-1 ring-offset-oscuro-900" : ""}`}
              />
            );
          })}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4">
          <div className="rounded-2xl border border-cyber-purple-500/30 bg-oscuro-950/70 p-3">
            <div className="grid grid-cols-2 gap-2">
              {builderCategories.map((categoria) => {
                const seleccionado = seleccion[categoria.id];
                const Icono = ICONO_CATEGORIA[categoria.id];
                const claveImagenSeleccion = seleccionado
                  ? `categoria-${categoria.id}-${seleccionado.id}`
                  : `categoria-${categoria.id}`;
                const mostrarImagenSeleccionada =
                  Boolean(seleccionado?.imagen) && !imagenesConError[claveImagenSeleccion];
                const activa = categoriaActiva === categoria.id;
                return (
                  <div
                    key={categoria.id}
                    role="button"
                    tabIndex={0}
                    aria-current={activa ? "true" : undefined}
                    onClick={() => setCategoriaActiva(categoria.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setCategoriaActiva(categoria.id);
                      }
                    }}
                    className={`relative cursor-pointer rounded-xl border p-2 transition-all hover:-translate-y-0.5 motion-reduce:transform-none ${
                      activa
                        ? "border-cyber-cyan-400 bg-cyber-cyan-500/10"
                        : "border-cyber-purple-500/25 bg-oscuro-800/70 hover:border-cyber-purple-400"
                    }`}
                  >
                    <div className="relative mb-2 flex h-16 items-center justify-center overflow-hidden rounded-lg border border-cyber-purple-500/30 bg-oscuro-900">
                      {seleccionado && (
                        <span
                          className="absolute left-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-cyber-lime-400 text-oscuro-950"
                          aria-hidden
                        >
                          <FiCheck size={12} />
                        </span>
                      )}
                      {seleccionado && (
                        <button
                          type="button"
                          aria-label={`Quitar ${categoria.nombre}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            quitarProducto(categoria.id);
                          }}
                          className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-oscuro-950 text-white shadow-md hover:bg-cyber-pink-500"
                        >
                          <FiX size={14} aria-hidden />
                        </button>
                      )}
                      {seleccionado && mostrarImagenSeleccionada ? (
                        <Image
                          src={seleccionado.imagen}
                          alt={seleccionado.nombre}
                          fill
                          sizes="96px"
                          className="object-contain p-1"
                          onError={() => marcarImagenConError(claveImagenSeleccion)}
                        />
                      ) : (
                        <Icono className="text-cyber-cyan-300" size={26} aria-hidden />
                      )}
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-cyber-cyan-200">
                      {categoria.nombre}
                    </p>
                    <p className="mt-1 line-clamp-2 min-h-[2rem] text-[10px] text-cyber-cyan-200/70">
                      {seleccionado ? seleccionado.nombre : "Sin seleccionar"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-cyber-purple-500/30 bg-oscuro-800/70 p-3">
            <p className="text-xs uppercase tracking-wide text-cyber-cyan-300">Total actual</p>
            <p className="mt-1 text-2xl font-black text-cyber-cyan-300">
              {formatearPrecio(subtotal)}
            </p>
            {categoriasCompletadas > 0 && faltan > 0 && (
              <p className="mt-1 text-xs text-cyber-cyan-200/80">{textoFaltan}</p>
            )}
            {choques.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-cyber-pink-300">
                {choques.map((choque) => (
                  <li key={choque}>{choque}</li>
                ))}
              </ul>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={limpiarBuild}
                disabled={sinPiezas}
                className="rounded-md border border-cyber-purple-500/40 px-3 py-2 text-center text-xs font-semibold leading-tight text-cyber-cyan-200 hover:bg-oscuro-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Vaciar armado
              </button>
              <button
                type="button"
                disabled={sinPiezas || choques.length > 0}
                onClick={irAlCheckout}
                className="rounded-md bg-cyber-cyan-500 px-3 py-2 text-center text-xs font-bold leading-tight text-white hover:bg-cyber-cyan-400 disabled:cursor-not-allowed disabled:bg-oscuro-700 disabled:text-cyber-cyan-200/50"
              >
                Ir al checkout
              </button>
            </div>
            <button
              type="button"
              onClick={guardarConfiguracion}
              disabled={guardando}
              className="mt-2 w-full rounded-md border border-cyber-lime-400/50 px-3 py-2 text-sm font-semibold text-cyber-lime-400 hover:bg-cyber-lime-400/10 disabled:opacity-70"
            >
              {guardando ? "Guardando..." : "Guardar configuracion"}
            </button>
            {feedback && (
              <p className="mt-2 text-xs text-cyber-cyan-200/80">{feedback}</p>
            )}
          </div>
        </aside>

        <div className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-foreground">
              Elegí {categoriaActivaMeta?.nombre}
            </h2>
            <p className="text-xs text-cyber-cyan-200/75">
              {productosCategoria.length} opciones disponibles
            </p>
          </div>

          <div className="space-y-3">
            {productosCategoria.map((producto) => {
              const seleccionado = seleccion[categoriaActiva]?.id === producto.id;
              const motivo = producto.stock
                ? motivoIncompatibilidad(producto, seleccion)
                : null;
              const bloqueado = !producto.stock || Boolean(motivo);
              const claveImagenProducto = `producto-${producto.id}`;
              const mostrarImagenProducto =
                Boolean(producto.imagen) && !imagenesConError[claveImagenProducto];
              const Icono = categoriaActivaMeta
                ? ICONO_CATEGORIA[categoriaActivaMeta.id]
                : FiCpu;
              const chips = chipsDeProducto(producto);
              return (
                <article
                  key={producto.id}
                  className={`rounded-xl border p-3 transition-all hover:-translate-y-0.5 motion-reduce:transform-none ${
                    seleccionado
                      ? "border-cyber-cyan-400 bg-cyber-cyan-500/10"
                      : "border-cyber-purple-500/25 bg-oscuro-800/75 hover:border-cyber-purple-400"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative h-20 w-full overflow-hidden rounded-xl border border-cyber-purple-500/25 bg-oscuro-900 sm:w-24">
                      {mostrarImagenProducto ? (
                        <Image
                          src={producto.imagen}
                          alt={producto.nombre}
                          fill
                          sizes="96px"
                          className="object-contain p-2"
                          onError={() => marcarImagenConError(claveImagenProducto)}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-cyber-cyan-300">
                          <Icono size={28} aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                        {producto.nombre}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-xs text-cyber-cyan-200/75">
                        {producto.descripcion}
                      </p>
                      {chips.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1">
                          {chips.map((chip) => (
                            <li
                              key={chip}
                              className="rounded-full border border-cyber-purple-500/35 bg-oscuro-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyber-cyan-200"
                            >
                              {chip}
                            </li>
                          ))}
                        </ul>
                      )}
                      {!producto.stock ? (
                        <p className="mt-2 text-[11px] font-semibold text-cyber-pink-300">
                          Sin stock
                        </p>
                      ) : motivo ? (
                        <p className="mt-2 text-[11px] font-semibold text-cyber-pink-300">
                          {motivo}
                        </p>
                      ) : (
                        <p className="mt-2">
                          <span className="inline-flex rounded-full bg-cyber-lime-400/15 px-2 py-0.5 text-[11px] font-semibold text-cyber-lime-400">
                            Compatible
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="sm:w-[140px] sm:text-right">
                      <p className="text-lg font-black text-cyber-cyan-300">
                        {formatearPrecio(producto.precio)}
                      </p>
                      <button
                        type="button"
                        disabled={bloqueado}
                        onClick={() => agregarProducto(producto)}
                        className="mt-2 w-full rounded-md bg-cyber-purple-500 px-3 py-2 text-sm font-bold text-white hover:bg-cyber-purple-400 disabled:cursor-not-allowed disabled:bg-oscuro-700 disabled:text-muted"
                      >
                        {seleccionado ? "Elegido" : "Agregar"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
