"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatearPrecio } from "@/utils/formato";

interface CompraEjemplo {
  id: string;
  fecha: string;
  estado: string;
  total: number;
}

const comprasMock: CompraEjemplo[] = [
  { id: "AUR-22041", fecha: "2026-03-20", estado: "Entregado", total: 749999 },
  { id: "AUR-21988", fecha: "2026-03-06", estado: "Entregado", total: 218607 },
  { id: "AUR-21855", fecha: "2026-02-28", estado: "En camino", total: 129999 },
  { id: "AUR-21690", fecha: "2026-02-11", estado: "Entregado", total: 389999 },
];

export default function UsuarioPage() {
  const { user } = useAuth();
  const [metodosPago, setMetodosPago] = useState<string[]>([
    "Visa **** 4821",
    "Mastercard **** 0974",
  ]);
  const [nuevoMetodo, setNuevoMetodo] = useState("");
  const [preferenciaAyuda, setPreferenciaAyuda] = useState<"whatsapp" | "email" | "ambos">("ambos");

  if (!user) {
    return (
      <main className="min-h-screen bg-oscuro-950">
        <section className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-6 text-center">
            <h1 className="text-2xl font-black text-white">Área de Usuario</h1>
            <p className="mt-3 text-sm text-cyber-cyan-200/85">
              Iniciá sesión para ver tu perfil, compras, medios de pago y soporte.
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-md border border-cyber-cyan-400/55 bg-cyber-cyan-500/10 px-5 py-2 text-sm font-bold text-cyber-cyan-300 hover:bg-cyber-cyan-400 hover:text-oscuro-950"
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
          <h1 className="text-xl font-black text-white">Usuario</h1>
          <p className="mt-3 text-sm text-cyber-cyan-200/85"><span className="font-semibold">Email:</span> {user.email}</p>
          <p className="mt-1 text-sm text-cyber-cyan-200/85"><span className="font-semibold">ID:</span> {user.id.slice(0, 8)}...</p>
          <p className="mt-1 text-sm text-cyber-cyan-200/85"><span className="font-semibold">Estado:</span> Activo</p>
        </article>

        <article className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-5 lg:col-span-2">
          <h2 className="text-lg font-bold text-white">Cambiar contraseña</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-3">
            <input type="password" placeholder="Contraseña actual" className="rounded-md border border-cyber-purple-500/40 bg-oscuro-800 px-3 py-2 text-sm text-cyber-cyan-100 outline-none focus:border-cyber-cyan-400" />
            <input type="password" placeholder="Nueva contraseña" className="rounded-md border border-cyber-purple-500/40 bg-oscuro-800 px-3 py-2 text-sm text-cyber-cyan-100 outline-none focus:border-cyber-cyan-400" />
            <input type="password" placeholder="Confirmar contraseña" className="rounded-md border border-cyber-purple-500/40 bg-oscuro-800 px-3 py-2 text-sm text-cyber-cyan-100 outline-none focus:border-cyber-cyan-400" />
          </form>
          <button type="button" className="mt-3 rounded-md border border-cyber-cyan-400/55 bg-cyber-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyber-cyan-300 hover:bg-cyber-cyan-400 hover:text-oscuro-950">
            Guardar contraseña
          </button>
        </article>

        <article className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-5 lg:col-span-2">
          <h2 className="text-lg font-bold text-white">Compras realizadas</h2>
          <ul className="mt-4 space-y-2">
            {comprasMock.map((compra) => (
              <li key={compra.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-cyber-purple-500/25 bg-oscuro-800/80 px-3 py-2 text-sm">
                <span className="font-semibold text-cyber-cyan-200">{compra.id}</span>
                <span className="text-cyber-cyan-100/75">{compra.fecha}</span>
                <span className="text-cyber-cyan-300">{compra.estado}</span>
                <span className="font-bold text-white">{formatearPrecio(compra.total)}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-5 lg:col-span-1">
          <h2 className="text-lg font-bold text-white">Formas de pago</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {metodosPago.map((metodo) => (
              <li key={metodo} className="rounded-md border border-cyber-purple-500/25 bg-oscuro-800/80 px-3 py-2 text-cyber-cyan-100/85">
                {metodo}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              value={nuevoMetodo}
              onChange={(e) => setNuevoMetodo(e.target.value)}
              placeholder="Ej: Amex **** 3321"
              className="flex-1 rounded-md border border-cyber-purple-500/40 bg-oscuro-800 px-3 py-2 text-sm text-cyber-cyan-100 outline-none focus:border-cyber-cyan-400"
            />
            <button
              type="button"
              onClick={() => {
                if (!nuevoMetodo.trim()) return;
                setMetodosPago((previo) => [...previo, nuevoMetodo.trim()]);
                setNuevoMetodo("");
              }}
              className="rounded-md border border-cyber-cyan-400/55 bg-cyber-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyber-cyan-300 hover:bg-cyber-cyan-400 hover:text-oscuro-950"
            >
              Agregar
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-5 lg:col-span-3">
          <h2 className="text-lg font-bold text-white">Mesa de ayuda</h2>
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
