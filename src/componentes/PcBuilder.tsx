"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { builderCategories, builderProducts } from "@/datos/pcBuilder";
import { formatearPrecio } from "@/utils/formato";
import { obtenerClienteSupabase } from "@/configuracion/supabase";
import { calcularSubtotalBuilder, useBuilderStore } from "@/store/builderStore";
import { guardarBuildConReintentos } from "@/servicios/buildsPcServicio";

export default function PcBuilder() {
  const {
    categoriaActiva,
    seleccion,
    setCategoriaActiva,
    seleccionarProducto,
    quitarProducto,
    limpiarBuild,
  } = useBuilderStore();
  const [guardando, setGuardando] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [usuario, setUsuario] = useState<User | null>(null);
  const [imagenesConError, setImagenesConError] = useState<Record<string, true>>({});

  const supabase = obtenerClienteSupabase();

  const productosCategoria = useMemo(
    () =>
      builderProducts.filter((producto) => producto.categoria === categoriaActiva),
    [categoriaActiva]
  );

  const subtotal = useMemo(() => calcularSubtotalBuilder(seleccion), [seleccion]);
  const categoriasCompletadas = useMemo(
    () => builderCategories.filter((categoria) => Boolean(seleccion[categoria.id])).length,
    [seleccion]
  );
  const categoriaActivaMeta = useMemo(
    () => builderCategories.find((cat) => cat.id === categoriaActiva),
    [categoriaActiva]
  );

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUsuario(data.user ?? null));
  }, [supabase]);

  const guardarConfiguracion = async () => {
    setFeedback("");

    if (!supabase) {
      setFeedback("Configurá Supabase para guardar builds en base de datos real.");
      return;
    }

    if (!usuario) {
      setFeedback("Iniciá sesión para guardar esta configuración.");
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
    const resultado = await guardarBuildConReintentos(supabase, {
      user_id: usuario.id,
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

  return (
    <section className="mx-auto my-8 grid max-w-7xl gap-4 px-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-black text-white">Armá tu PC</h1>
          <span className="rounded-md border border-cyber-cyan-400/40 bg-cyber-cyan-500/10 px-2 py-1 text-[11px] font-bold text-cyber-cyan-200">
            {categoriasCompletadas}/{builderCategories.length}
          </span>
        </div>
        <p className="mb-4 text-xs text-cyber-cyan-200/80">
          Elegi una categoria y agrega un componente para completar tu build.
        </p>

        <div className="rounded-2xl border border-cyber-purple-500/30 bg-oscuro-950/70 p-3">
          <div className="grid grid-cols-2 gap-2">
            {builderCategories.map((categoria) => {
              const seleccionado = seleccion[categoria.id];
              const claveImagenSeleccion = seleccionado
                ? `categoria-${categoria.id}-${seleccionado.id}`
                : `categoria-${categoria.id}`;
              const mostrarImagenSeleccionada =
                Boolean(seleccionado?.imagen) && !imagenesConError[claveImagenSeleccion];
              return (
                <div
                  key={categoria.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setCategoriaActiva(categoria.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCategoriaActiva(categoria.id);
                    }
                  }}
                  className={`relative cursor-pointer rounded-xl border p-2 transition-all ${
                    categoriaActiva === categoria.id
                      ? "border-cyber-cyan-400 bg-cyber-cyan-500/10"
                      : "border-cyber-purple-500/25 bg-oscuro-800/70 hover:border-cyber-purple-400"
                  }`}
                >
                  {seleccionado && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        quitarProducto(categoria.id);
                      }}
                      className="absolute right-1 top-1 rounded border border-cyber-pink-500/50 px-1 text-[10px] font-bold uppercase text-cyber-pink-300 hover:bg-cyber-pink-500/20"
                    >
                      X
                    </button>
                  )}

                  <div className="relative mb-2 flex h-16 items-center justify-center overflow-hidden rounded-lg border border-cyber-purple-500/30 bg-oscuro-900">
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
                      <span className="text-xs font-black uppercase tracking-wide text-cyber-cyan-300">
                        {categoria.icono}
                      </span>
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
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={limpiarBuild}
              className="rounded-md border border-cyber-purple-500/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-cyber-cyan-200 hover:bg-oscuro-700"
            >
              Volver atras
            </button>
            <Link
              href="/checkout"
              className="rounded-md bg-cyber-cyan-500 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-oscuro-950 hover:bg-cyber-cyan-400"
            >
              Siguiente paso
            </Link>
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
          <h2 className="text-lg font-bold text-white">
            Elegí {categoriaActivaMeta?.nombre}
          </h2>
          <p className="text-xs text-cyber-cyan-200/75">
            {productosCategoria.length} opciones disponibles
          </p>
        </div>

        <div className="space-y-3">
          {productosCategoria.map((producto) => {
            const seleccionado = seleccion[categoriaActiva]?.id === producto.id;
            const claveImagenProducto = `producto-${producto.id}`;
            const mostrarImagenProducto = Boolean(producto.imagen) && !imagenesConError[claveImagenProducto];
            return (
              <article
                key={producto.id}
                className={`rounded-xl border p-3 transition-all ${
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
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs font-black uppercase tracking-wide text-cyber-cyan-300">
                          {categoriaActivaMeta?.icono ?? "PC"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">
                      {producto.nombre}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-cyber-cyan-200/75">
                      {producto.descripcion}
                    </p>
                  </div>
                  <div className="sm:w-[170px] sm:text-right">
                    <p className="text-lg font-black text-cyber-cyan-300">
                      {formatearPrecio(producto.precio)}
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-cyber-lime-300/90">
                      {producto.stock ? "Compatible" : "Sin stock"}
                    </p>
                    <button
                      type="button"
                      disabled={!producto.stock}
                      onClick={() => seleccionarProducto(producto)}
                      className="mt-2 w-full rounded-md bg-cyber-purple-500 px-3 py-2 text-sm font-bold text-white hover:bg-cyber-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {seleccionado ? "Seleccionado" : "Agregar"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
