"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatearPrecio } from "@/utils/formato";
import { METODOS_PAGO } from "@/tipos/metodoPago";
import {
  etiquetaEstadoPedido,
  etiquetaMetodoPago,
  montoPedidoEnPesos,
  obtenerPedidosUsuario,
  type Pedido,
} from "@/servicios/pedidosServicio";
import { apiFetch } from "@/lib/api-client";
import { obtenerApiToken } from "@/lib/api-token";
import { MENSAJE_REQUISITOS_PASSWORD, validarPassword } from "@/lib/auth";

export default function UsuarioPage() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [preferenciaAyuda, setPreferenciaAyuda] = useState<"whatsapp" | "email" | "ambos">("ambos");

  const metodosUsados = useMemo(() => {
    const unicos = new Set(
      pedidos.map((pedido) => pedido.metodoPago).filter(Boolean) as string[]
    );
    return Array.from(unicos);
  }, [pedidos]);

  useEffect(() => {
    if (!user) {
      setPedidos([]);
      return;
    }

    const userId = user.uid;
    let cancelado = false;

    async function cargarPedidos() {
      setCargandoPedidos(true);
      try {
        const resultado = await obtenerPedidosUsuario(userId);
        if (!cancelado) setPedidos(resultado);
      } catch {
        if (!cancelado) setPedidos([]);
      } finally {
        if (!cancelado) setCargandoPedidos(false);
      }
    }

    cargarPedidos();

    return () => {
      cancelado = true;
    };
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-screen bg-oscuro-950">
        <section className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-6 text-center">
            <h1 className="text-2xl font-black text-foreground">Área de Usuario</h1>
            <p className="mt-3 text-sm text-cyber-cyan-200/85">
              Iniciá sesión para ver tu perfil, compras, medios de pago y soporte.
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-md border border-cyber-cyan-400/55 bg-cyber-cyan-500/10 px-5 py-2 text-sm font-bold text-cyber-cyan-300 hover:bg-cyber-cyan-400 hover:text-white"
            >
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 lg:grid-cols-3">
        <article className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-5 lg:col-span-1">
          <h1 className="text-xl font-black text-foreground">Usuario</h1>
          <p className="mt-3 text-sm text-cyber-cyan-200/85"><span className="font-semibold">Email:</span> {user.email}</p>
          <p className="mt-1 text-sm text-cyber-cyan-200/85"><span className="font-semibold">ID:</span> {user.uid.slice(0, 8)}...</p>
          <p className="mt-1 text-sm text-cyber-cyan-200/85"><span className="font-semibold">Estado:</span> Activo</p>
        </article>

        <article className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-5 lg:col-span-2">
          <h2 className="text-lg font-bold text-foreground">Cambiar contraseña</h2>
          <CambiarPasswordForm />
        </article>

        <article className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-5 lg:col-span-2">
          <h2 className="text-lg font-bold text-foreground">Compras realizadas</h2>
          {cargandoPedidos ? (
            <p className="mt-4 text-sm text-cyber-cyan-200/75">Cargando pedidos...</p>
          ) : pedidos.length === 0 ? (
            <p className="mt-4 rounded-lg border border-cyber-purple-500/25 bg-oscuro-800/80 px-3 py-3 text-sm text-cyber-cyan-200/75">
              Todavía no tenés compras registradas. Cuando completes un pago en checkout, aparecerán acá.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {pedidos.map((pedido) => (
                <li
                  key={pedido.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-cyber-purple-500/25 bg-oscuro-800/80 px-3 py-2 text-sm"
                >
                  <span className="font-semibold text-cyber-cyan-200">{pedido.id.slice(0, 8)}...</span>
                  <span className="text-cyber-cyan-100/75">
                    {pedido.createdAt
                      ? pedido.createdAt.toLocaleDateString("es-AR")
                      : "—"}
                  </span>
                  <span className="text-cyber-cyan-300">{etiquetaEstadoPedido(pedido.estado)}</span>
                  {pedido.metodoPago && (
                    <span className="text-xs text-cyber-cyan-200/70">
                      {etiquetaMetodoPago(pedido.metodoPago)}
                      {pedido.metodoPago === "credito" && pedido.cuotas
                        ? ` · ${pedido.cuotas} cuotas`
                        : ""}
                    </span>
                  )}
                  <span className="font-bold text-foreground">
                    {formatearPrecio(montoPedidoEnPesos(pedido))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-5 lg:col-span-1">
          <h2 className="text-lg font-bold text-foreground">Formas de pago</h2>
          <p className="mt-2 text-xs text-cyber-cyan-200/70">
            Métodos disponibles en checkout
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {METODOS_PAGO.map((metodo) => (
              <li
                key={metodo.id}
                className="rounded-md border border-cyber-purple-500/25 bg-oscuro-800/80 px-3 py-2"
              >
                <p className="font-semibold text-cyber-cyan-100">{metodo.titulo}</p>
                <p className="text-xs text-cyber-cyan-200/70">{metodo.descripcion}</p>
              </li>
            ))}
          </ul>
          {metodosUsados.length > 0 && (
            <div className="mt-4 border-t border-cyber-purple-500/25 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyber-cyan-300">
                Usados en tus pedidos
              </p>
              <ul className="mt-2 space-y-1 text-sm text-cyber-cyan-200/85">
                {metodosUsados.map((metodo) => (
                  <li key={metodo}>• {etiquetaMetodoPago(metodo)}</li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-5 lg:col-span-3">
          <h2 className="text-lg font-bold text-foreground">Mesa de ayuda</h2>
          <p className="mt-2 text-sm text-cyber-cyan-200/85">
            Elegí tu canal de contacto preferido: WhatsApp, Email o ambos.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { id: "whatsapp", label: "WhatsApp" },
              { id: "email", label: "Email" },
              { id: "ambos", label: "Ambos" },
            ].map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                onClick={() => setPreferenciaAyuda(opcion.id as "whatsapp" | "email" | "ambos")}
                className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                  preferenciaAyuda === opcion.id
                    ? "border-cyber-cyan-400 bg-cyber-cyan-500/20 text-cyber-cyan-100"
                    : "border-cyber-purple-500/35 text-cyber-cyan-200 hover:bg-oscuro-800"
                }`}
              >
                {opcion.label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {(preferenciaAyuda === "whatsapp" || preferenciaAyuda === "ambos") && (
              <a
                href="https://wa.me/5491168883430?text=Hola,%20necesito%20ayuda%20con%20mi%20cuenta%20de%20Aura%20Pro."
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-[#25D366]/55 bg-[#25D366]/15 px-4 py-2 font-semibold text-[#b9ffd1] hover:bg-[#25D366]/25"
              >
                Escribir por WhatsApp
              </a>
            )}
            {(preferenciaAyuda === "email" || preferenciaAyuda === "ambos") && (
              <a
                href="mailto:soporte@aurapro.com?subject=Ayuda%20de%20usuario%20Aura%20Pro"
                className="rounded-md border border-cyber-purple-500/55 bg-cyber-purple-500/15 px-4 py-2 font-semibold text-cyber-cyan-100 hover:bg-cyber-purple-500/25"
              >
                Enviar email
              </a>
            )}
          </div>
        </article>

      </section>
    </main>
  );
}

function CambiarPasswordForm() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    if (nueva !== confirmacion) {
      setError("La confirmación no coincide.");
      return;
    }
    if (!validarPassword(nueva)) {
      setError(MENSAJE_REQUISITOS_PASSWORD);
      return;
    }
    const token = obtenerApiToken();
    if (!token) {
      setError("Sesión inválida. Volvé a iniciar sesión.");
      return;
    }
    setCargando(true);
    try {
      await apiFetch("/auth/password", {
        method: "PATCH",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual, nueva }),
      });
      setMensaje("Contraseña actualizada.");
      setActual("");
      setNueva("");
      setConfirmacion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña.");
    } finally {
      setCargando(false);
    }
  };

  const campo =
    "rounded-md border border-cyber-purple-500/40 bg-oscuro-800 px-3 py-2 text-sm text-cyber-cyan-100 outline-none focus:border-cyber-cyan-400";

  return (
    <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-cyber-cyan-200">Contraseña actual</span>
        <input
          type="password"
          autoComplete="current-password"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          required
          className={campo}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-cyber-cyan-200">Nueva contraseña</span>
        <input
          type="password"
          autoComplete="new-password"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          required
          minLength={10}
          className={campo}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-cyber-cyan-200">Confirmar contraseña</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          required
          minLength={10}
          className={campo}
        />
      </label>
      <div className="md:col-span-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={cargando}
          className="rounded-md border border-cyber-cyan-400/55 bg-cyber-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyber-cyan-300 hover:bg-cyber-cyan-400 hover:text-white disabled:opacity-50"
        >
          {cargando ? "Guardando..." : "Guardar contraseña"}
        </button>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {mensaje ? <p className="text-sm text-cyber-lime-400">{mensaje}</p> : null}
      </div>
    </form>
  );
}
