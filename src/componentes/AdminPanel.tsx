"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { obtenerAuthFirebase } from "@/configuracion/firebase";
import { formatearPrecio } from "@/utils/formato";
import { etiquetaEstadoPedido, etiquetaMetodoPago } from "@/servicios/pedidosServicio";
import { apiConfigurada } from "@/lib/api-client";
import { obtenerApiToken } from "@/lib/api-token";
import {
  actualizarPedidoAdminApi,
  obtenerCvAdminApi,
  obtenerPedidosAdminApi,
  obtenerPostulacionesAdminApi,
} from "@/servicios/apiBackendServicio";

interface PedidoAdmin {
  id: string;
  email: string | null;
  estado: string;
  metodoPago: string | null;
  totalPesos: number;
  createdAt: string | null;
}

interface PostulacionAdmin {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  cvNombre: string | null;
  createdAt: string | null;
}

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [postulaciones, setPostulaciones] = useState<PostulacionAdmin[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError("");

    const apiToken = obtenerApiToken();

    if (apiConfigurada() && apiToken) {
      try {
        const [datosPedidos, datosPostulaciones] = await Promise.all([
          obtenerPedidosAdminApi(apiToken),
          obtenerPostulacionesAdminApi(apiToken),
        ]);
        setPedidos(
          datosPedidos.map((p) => ({
            id: p.id,
            email: p.email,
            estado: p.estado,
            metodoPago: p.metodoPago,
            totalPesos: p.totalPesos,
            createdAt: p.createdAt,
          }))
        );
        setPostulaciones(
          datosPostulaciones.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            email: p.email,
            telefono: p.telefono,
            cvNombre: p.cvNombre,
            createdAt: p.createdAt,
          }))
        );
      } catch {
        setError("No se pudieron cargar los datos de administración.");
      } finally {
        setCargando(false);
      }
      return;
    }

    const auth = obtenerAuthFirebase();
    if (!auth?.currentUser) {
      setError("Debés iniciar sesión.");
      setCargando(false);
      return;
    }

    const idToken = await auth.currentUser.getIdToken();
    const headers = { Authorization: `Bearer ${idToken}` };

    try {
      const [respPedidos, respPostulaciones] = await Promise.all([
        fetch("/api/admin/pedidos", { headers }),
        fetch("/api/admin/postulaciones", { headers }),
      ]);

      if (respPedidos.status === 403 || respPostulaciones.status === 403) {
        setError("No tenés permisos de administrador.");
        return;
      }

      if (!respPedidos.ok || !respPostulaciones.ok) {
        setError("No se pudieron cargar los datos de administración.");
        return;
      }

      const datosPedidos = (await respPedidos.json()) as { pedidos: PedidoAdmin[] };
      const datosPostulaciones = (await respPostulaciones.json()) as {
        postulaciones: PostulacionAdmin[];
      };

      setPedidos(datosPedidos.pedidos ?? []);
      setPostulaciones(datosPostulaciones.postulaciones ?? []);
    } catch {
      setError("Error de red al cargar el panel.");
    } finally {
      setCargando(false);
    }
  }, []);

  const actualizarPedido = async (orderId: string, estado: string) => {
    const apiToken = obtenerApiToken();
    if (!apiConfigurada() || !apiToken) return;
    try {
      await actualizarPedidoAdminApi(apiToken, orderId, estado);
      await cargarDatos();
    } catch {
      setError("No se pudo actualizar el pedido.");
    }
  };

  const descargarCv = async (postulacionId: string) => {
    const apiToken = obtenerApiToken();
    if (!apiConfigurada() || !apiToken) return;
    try {
      const { url } = await obtenerCvAdminApi(apiToken, postulacionId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("No se pudo obtener el CV.");
    }
  };

  useEffect(() => {
    if (!loading && user) {
      void cargarDatos();
    }
  }, [loading, user, cargarDatos]);

  if (loading) {
    return <p className="text-sm text-cyber-cyan-200/80">Cargando panel...</p>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-6 text-center">
        <h1 className="text-2xl font-black text-white">Panel de administración</h1>
        <p className="mt-3 text-sm text-cyber-cyan-200/85">
          Iniciá sesión con una cuenta de administrador para continuar.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-md border border-cyber-cyan-400/55 bg-cyber-cyan-500/10 px-5 py-2 text-sm font-bold text-cyber-cyan-300"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Panel de administración</h1>
          <p className="mt-1 text-sm text-cyber-cyan-200/75">
            Sesión: {user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void cargarDatos()}
          disabled={cargando}
          className="rounded-md border border-cyber-cyan-400/55 bg-cyber-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyber-cyan-300 hover:bg-cyber-cyan-400 hover:text-oscuro-950 disabled:opacity-60"
        >
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-cyber-pink-500/40 bg-cyber-pink-500/10 p-4 text-sm text-cyber-pink-300">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-5">
        <h2 className="text-lg font-bold text-white">
          Pedidos pendientes ({pedidos.length})
        </h2>
        {pedidos.length === 0 ? (
          <p className="mt-3 text-sm text-cyber-cyan-200/70">No hay pedidos pendientes.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {pedidos.map((pedido) => (
              <li
                key={pedido.id}
                className="rounded-lg border border-cyber-purple-500/25 bg-oscuro-800/80 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-cyber-cyan-300">{pedido.id.slice(0, 8)}...</span>
                  <span className="text-cyber-cyan-200">{pedido.email ?? "—"}</span>
                  <span>{etiquetaEstadoPedido(pedido.estado)}</span>
                  <span>{etiquetaMetodoPago(pedido.metodoPago ?? undefined)}</span>
                  <span className="font-bold text-white">
                    {formatearPrecio(pedido.totalPesos)}
                  </span>
                </div>
                {apiConfigurada() && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void actualizarPedido(pedido.id, "paid")}
                      className="rounded border border-cyber-lime-400/50 px-2 py-1 text-xs text-cyber-lime-300"
                    >
                      Marcar pagado
                    </button>
                    <button
                      type="button"
                      onClick={() => void actualizarPedido(pedido.id, "ready_for_pickup")}
                      className="rounded border border-cyber-cyan-400/50 px-2 py-1 text-xs text-cyber-cyan-300"
                    >
                      Listo para retiro
                    </button>
                    <button
                      type="button"
                      onClick={() => void actualizarPedido(pedido.id, "cancelled")}
                      className="rounded border border-cyber-pink-400/50 px-2 py-1 text-xs text-cyber-pink-300"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-5">
        <h2 className="text-lg font-bold text-white">
          Postulaciones recibidas ({postulaciones.length})
        </h2>
        {postulaciones.length === 0 ? (
          <p className="mt-3 text-sm text-cyber-cyan-200/70">No hay postulaciones nuevas.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {postulaciones.map((postulacion) => (
              <li
                key={postulacion.id}
                className="rounded-lg border border-cyber-purple-500/25 bg-oscuro-800/80 px-3 py-2 text-sm"
              >
                <p className="font-semibold text-white">{postulacion.nombre}</p>
                <p className="text-cyber-cyan-200">{postulacion.email}</p>
                <p className="text-cyber-cyan-200/70">{postulacion.telefono}</p>
                {postulacion.cvNombre && (
                  <p className="text-xs text-cyber-cyan-300">CV: {postulacion.cvNombre}</p>
                )}
                {apiConfigurada() && (
                  <button
                    type="button"
                    onClick={() => void descargarCv(postulacion.id)}
                    className="mt-2 rounded border border-cyber-cyan-400/50 px-2 py-1 text-xs text-cyber-cyan-300"
                  >
                    Descargar CV
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
