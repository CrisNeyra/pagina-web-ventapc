"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiCpu,
  FiCreditCard,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiRepeat,
  FiShoppingBag,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { formatearPrecio } from "@/utils/formato";
import { METODOS_PAGO, type MetodoPago } from "@/tipos/metodoPago";
import {
  etiquetaEstadoPedido,
  etiquetaMetodoPago,
  montoPedidoEnPesos,
  obtenerPedidosUsuario,
  type Pedido,
} from "@/servicios/pedidosServicio";
import { apiFetch } from "@/lib/api-client";
import { MENSAJE_REQUISITOS_PASSWORD, validarPassword } from "@/lib/auth";

const WHATSAPP_AYUDA =
  "https://wa.me/5491168883430?text=Hola,%20necesito%20ayuda%20con%20mi%20cuenta%20de%20Aura%20Pro.";

const ICONO_PAGO: Record<MetodoPago, typeof FiDollarSign> = {
  efectivo: FiMapPin,
  transferencia: FiRepeat,
  debito: FiCreditCard,
  credito: FiCreditCard,
};

function claseEstado(estado: string): string {
  if (estado === "paid" || estado === "ready_for_pickup" || estado === "shipped") {
    return "bg-emerald-50 text-emerald-800";
  }
  if (estado === "payment_failed" || estado === "cancelled") {
    return "bg-red-50 text-red-800";
  }
  return "bg-amber-50 text-amber-800";
}

function tituloPedido(pedido: Pedido): string {
  const primero = pedido.items.find((item) => item.nombre)?.nombre;
  if (!primero) return "Pedido";
  const extras = pedido.items.length - 1;
  return extras > 0 ? `${primero} +${extras}` : primero;
}

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
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-6 text-center shadow-sm">
            <h1 className="text-2xl font-black text-foreground">Área de Usuario</h1>
            <p className="mt-3 text-sm text-cyber-cyan-200/85">
              Iniciá sesión para ver tu perfil, compras, medios de pago y soporte.
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-md bg-cyber-purple-500 px-5 py-2 text-sm font-bold text-white hover:bg-cyber-purple-400"
            >
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const inicial = (user.email?.trim()[0] ?? "A").toUpperCase();
  const nombre = user.email?.split("@")[0] ?? "tu cuenta";

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8">
        <header className="rounded-3xl bg-gradient-to-r from-ink-violet via-[#5b21b6] to-ink-cyan p-6 text-white shadow-md sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <span
              aria-hidden
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-black"
            >
              {inicial}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-white/80">Hola</p>
              <h1 className="truncate text-2xl font-black sm:text-3xl">{nombre}</h1>
              <p className="mt-1 truncate text-sm text-white/85">{user.email}</p>
            </div>
            <span className="ml-auto rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              Activo
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink-violet hover:bg-white/90"
            >
              <FiShoppingBag aria-hidden />
              Seguir comprando
            </Link>
            <Link
              href="/arma-tu-pc"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25"
            >
              <FiCpu aria-hidden />
              Armá tu PC
            </Link>
            <a
              href={WHATSAPP_AYUDA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25"
            >
              <FiMessageCircle aria-hidden />
              Escribir por WhatsApp
            </a>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-2xl border border-cyber-purple-500/25 bg-oscuro-900 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none lg:col-span-2">
            <h2 className="text-lg font-bold text-foreground">Compras realizadas</h2>
            {cargandoPedidos ? (
              <p className="mt-4 text-sm text-muted">Cargando pedidos...</p>
            ) : pedidos.length === 0 ? (
              <div className="mt-4 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-cyber-purple-500/35 bg-oscuro-800/50 px-4 py-6">
                <FiShoppingBag className="h-8 w-8 text-ink-violet" aria-hidden />
                <p className="max-w-md text-sm text-foreground">
                  Todavía no tenés compras. Cuando completes un pago en el checkout, el pedido
                  aparece acá con su estado y el monto.
                </p>
                <Link
                  href="/productos"
                  className="rounded-md bg-cyber-purple-500 px-4 py-2 text-sm font-bold text-white hover:bg-cyber-purple-400"
                >
                  Ver productos
                </Link>
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {pedidos.map((pedido) => (
                  <li
                    key={pedido.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-cyber-purple-500/20 bg-oscuro-800/60 px-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{tituloPedido(pedido)}</p>
                      <p className="text-xs text-muted">
                        {pedido.createdAt
                          ? pedido.createdAt.toLocaleDateString("es-AR")
                          : "Sin fecha"}
                        {pedido.metodoPago ? ` · ${etiquetaMetodoPago(pedido.metodoPago)}` : ""}
                        {pedido.metodoPago === "credito" && pedido.cuotas
                          ? ` · ${pedido.cuotas} cuotas`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${claseEstado(pedido.estado)}`}
                    >
                      {etiquetaEstadoPedido(pedido.estado)}
                    </span>
                    <span className="font-bold text-foreground">
                      {formatearPrecio(montoPedidoEnPesos(pedido))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="rounded-2xl border border-cyber-purple-500/25 bg-oscuro-900 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none">
            <h2 className="text-lg font-bold text-foreground">Contraseña</h2>
            <p className="mt-1 text-xs text-muted">{MENSAJE_REQUISITOS_PASSWORD}</p>
            <CambiarPasswordForm />
          </article>

          <article className="rounded-2xl border border-cyber-purple-500/25 bg-oscuro-900 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none lg:col-span-1">
            <h2 className="text-lg font-bold text-foreground">Formas de pago</h2>
            <p className="mt-1 text-xs text-muted">Métodos disponibles en el checkout</p>
            <ul className="mt-3 space-y-2">
              {METODOS_PAGO.map((metodo) => {
                const Icono = ICONO_PAGO[metodo.id];
                const usado = metodosUsados.includes(metodo.id);
                return (
                  <li
                    key={metodo.id}
                    className="flex items-start gap-3 rounded-xl border border-cyber-purple-500/20 bg-oscuro-800/60 px-3 py-2"
                  >
                    <Icono className="mt-0.5 h-4 w-4 shrink-0 text-ink-violet" aria-hidden />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                        {metodo.titulo}
                        {usado && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                            Usado
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted">{metodo.descripcion}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="rounded-2xl border border-cyber-purple-500/25 bg-oscuro-900 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none lg:col-span-2">
            <h2 className="text-lg font-bold text-foreground">Mesa de ayuda</h2>
            <p className="mt-1 text-sm text-muted">Elegí cómo preferís que te contactemos.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {(
                [
                  { id: "whatsapp", label: "WhatsApp", detalle: "Chat directo" },
                  { id: "email", label: "Email", detalle: "soporte@aurapro.com" },
                  { id: "ambos", label: "Ambos", detalle: "Los dos canales" },
                ] as const
              ).map((opcion) => (
                <button
                  key={opcion.id}
                  type="button"
                  aria-pressed={preferenciaAyuda === opcion.id}
                  onClick={() => setPreferenciaAyuda(opcion.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    preferenciaAyuda === opcion.id
                      ? "border-cyber-purple-500 bg-cyber-purple-500/10 shadow-sm"
                      : "border-cyber-purple-500/25 hover:border-cyber-purple-500/50"
                  }`}
                >
                  <span className="block text-sm font-bold text-foreground">{opcion.label}</span>
                  <span className="text-xs text-muted">{opcion.detalle}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {(preferenciaAyuda === "whatsapp" || preferenciaAyuda === "ambos") && (
                <a
                  href={WHATSAPP_AYUDA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-bold text-[#103022] hover:bg-[#1ebe5d]"
                >
                  <FiMessageCircle aria-hidden />
                  Escribir por WhatsApp
                </a>
              )}
              {(preferenciaAyuda === "email" || preferenciaAyuda === "ambos") && (
                <a
                  href="mailto:soporte@aurapro.com?subject=Ayuda%20de%20usuario%20Aura%20Pro"
                  className="inline-flex items-center gap-2 rounded-md bg-cyber-purple-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyber-purple-400"
                >
                  <FiMail aria-hidden />
                  Enviar email
                </a>
              )}
            </div>
          </article>
        </div>
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
    setCargando(true);
    try {
      await apiFetch("/auth/password", {
        method: "PATCH",
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
    "w-full rounded-md border border-cyber-purple-500/30 bg-oscuro-800 px-3 py-2 text-sm text-foreground outline-none focus:border-cyber-purple-500";

  return (
    <form className="mt-4 space-y-3" onSubmit={onSubmit}>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">Contraseña actual</span>
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
        <span className="mb-1 block text-xs font-medium text-muted">Nueva contraseña</span>
        <input
          type="password"
          autoComplete="new-password"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          required
          minLength={6}
          maxLength={10}
          className={campo}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">Confirmar contraseña</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          required
          minLength={6}
          maxLength={10}
          className={campo}
        />
      </label>
      <button
        type="submit"
        disabled={cargando}
        className="w-full rounded-md bg-cyber-purple-500 px-4 py-2 text-sm font-bold text-white hover:bg-cyber-purple-400 disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Guardar contraseña"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {mensaje ? <p className="text-sm text-emerald-700">{mensaje}</p> : null}
    </form>
  );
}
