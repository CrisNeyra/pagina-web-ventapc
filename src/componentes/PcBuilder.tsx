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

  const supabase = obtenerClienteSupabase();

  const productosCategoria = useMemo(
    () =>
      builderProducts.filter((producto) => producto.categoria === categoriaActiva),
    [categoriaActiva]
  );

  const subtotal = useMemo(() => calcularSubtotalBuilder(seleccion), [seleccion]);

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

  return (
    <section className="mx-auto my-8 grid max-w-7xl gap-4 px-4 lg:grid-cols-[360px_1fr]">
      <aside className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4">
        <h1 className="mb-3 text-xl font-black text-white">Armá tu PC</h1>
        <p className="mb-4 text-xs text-cyber-cyan-200/80">
          Seleccioná cada componente y armá tu configuración ideal.
        </p>

        <ul className="space-y-2">
          {builderCategories.map((categoria) => {
            const seleccionado = seleccion[categoria.id];
            return (
              <li key={categoria.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setCategoriaActiva(categoria.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCategoriaActiva(categoria.id);
                    }
                  }}
                  className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-all ${
                    categoriaActiva === categoria.id
                      ? "border-cyber-cyan-400 bg-cyber-cyan-500/10"
                      : "border-cyber-purple-500/25 bg-oscuro-800/70 hover:border-cyber-purple-400"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-cyber-cyan-200">
                      {categoria.icono}
                    </span>
                    {seleccionado && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          quitarProducto(categoria.id);
                        }}
                        className="text-[11px] text-cyber-pink-400 hover:text-cyber-pink-300"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white">{categoria.nombre}</p>
                  <p className="mt-1 text-xs text-cyber-cyan-200/75">
                    {seleccionado
                      ? `${seleccionado.nombre} · ${formatearPrecio(seleccionado.precio)}`
                      : "Sin seleccionar"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 rounded-xl border border-cyber-purple-500/30 bg-oscuro-800/70 p-3">
          <p className="text-xs uppercase tracking-wide text-cyber-cyan-300">Subtotal</p>
          <p className="mt-1 text-2xl font-black text-cyber-cyan-300">
            {formatearPrecio(subtotal)}
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/checkout"
              className="flex-1 rounded-md bg-cyber-cyan-500 px-3 py-2 text-center text-sm font-bold text-oscuro-950 hover:bg-cyber-cyan-400"
            >
              Avanzar al pago
            </Link>
            <button
              type="button"
              onClick={limpiarBuild}
              className="rounded-md border border-cyber-purple-500/40 px-3 py-2 text-sm font-semibold text-cyber-cyan-200 hover:bg-oscuro-700"
            >
              Limpiar
            </button>
          </div>
          <button
            type="button"
            onClick={guardarConfiguracion}
            disabled={guardando}
            className="mt-2 w-full rounded-md border border-cyber-lime-400/50 px-3 py-2 text-sm font-semibold text-cyber-lime-400 hover:bg-cyber-lime-400/10 disabled:opacity-70"
          >
            {guardando ? "Guardando..." : "Guardar configuración"}
          </button>
          {feedback && (
            <p className="mt-2 text-xs text-cyber-cyan-200/80">{feedback}</p>
          )}
        </div>
      </aside>

      <div className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-white">
            Elegí {builderCategories.find((cat) => cat.id === categoriaActiva)?.nombre}
          </h2>
          <p className="text-xs text-cyber-cyan-200/75">
            {productosCategoria.length} opciones disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {productosCategoria.map((producto) => {
            const seleccionado = seleccion[categoriaActiva]?.id === producto.id;
            return (
              <article
                key={producto.id}
                className={`rounded-xl border p-3 transition-all ${
                  seleccionado
                    ? "border-cyber-cyan-400 bg-cyber-cyan-500/10"
                    : "border-cyber-purple-500/25 bg-oscuro-800/75 hover:border-cyber-purple-400"
                }`}
              >
                <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl bg-oscuro-900">
                  <Image
                    src={producto.imagen}
                    alt={producto.nombre}
                    fill
                    sizes="(max-width: 1280px) 50vw, 25vw"
                    className="object-contain p-2"
                  />
                </div>
                <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-semibold text-white">
                  {producto.nombre}
                </h3>
                <p className="mt-1 line-clamp-2 min-h-[2.2rem] text-xs text-cyber-cyan-200/75">
                  {producto.descripcion}
                </p>
                <p className="mt-2 text-lg font-black text-cyber-cyan-300">
                  {formatearPrecio(producto.precio)}
                </p>
                <button
                  type="button"
                  disabled={!producto.stock}
                  onClick={() => seleccionarProducto(producto)}
                  className="mt-2 w-full rounded-md bg-cyber-purple-500 px-3 py-2 text-sm font-bold text-white hover:bg-cyber-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {seleccionado ? "Seleccionado" : "Agregar"}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
