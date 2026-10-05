"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MENSAJE_REQUISITOS_PASSWORD, validarPassword } from "@/lib/auth";

export default function RestablecerForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [repetir, setRepetir] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("El enlace no es válido. Pedí uno nuevo desde el inicio de sesión.");
      return;
    }
    if (!validarPassword(password)) {
      setError(MENSAJE_REQUISITOS_PASSWORD);
      return;
    }
    if (password !== repetir) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      const respuesta = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const datos = (await respuesta.json().catch(() => ({}))) as { message?: string };
      if (!respuesta.ok) {
        setError(
          datos.message === "TOKEN_INVALIDO"
            ? "El enlace venció o ya se usó. Pedí uno nuevo."
            : datos.message === "DATOS_INVALIDOS"
              ? MENSAJE_REQUISITOS_PASSWORD
              : "No se pudo restablecer la contraseña."
        );
        return;
      }
      setOk(true);
    } catch {
      setError("No se pudo restablecer la contraseña.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="w-full rounded-2xl border border-cyber-purple-500/40 bg-oscuro-900 p-5">
      <h1 className="text-xl font-bold text-foreground">Nueva contraseña</h1>
      <p className="mt-1 text-xs text-cyber-cyan-200/80">{MENSAJE_REQUISITOS_PASSWORD}</p>

      {ok ? (
        <p className="mt-4 text-sm text-cyber-lime-400">
          Contraseña actualizada.{" "}
          <Link href="/?auth=required" className="underline">
            Iniciá sesión
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={enviar} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cyber-cyan-200">
              Contraseña nueva
            </span>
            <div className="relative">
              <input
                type={mostrar ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={10}
                maxLength={72}
                autoComplete="new-password"
                className="min-h-11 w-full rounded-md border border-cyber-purple-500/45 bg-oscuro-950 px-3 py-2 pr-10 text-sm text-cyber-cyan-100 outline-none focus:border-cyber-cyan-400"
              />
              <button
                type="button"
                onClick={() => setMostrar((prev) => !prev)}
                aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-cyber-cyan-200/80"
              >
                {mostrar ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cyber-cyan-200">
              Repetir contraseña
            </span>
            <input
              type={mostrar ? "text" : "password"}
              value={repetir}
              onChange={(e) => setRepetir(e.target.value)}
              required
              minLength={10}
              maxLength={72}
              autoComplete="new-password"
              className="min-h-11 w-full rounded-md border border-cyber-purple-500/45 bg-oscuro-950 px-3 py-2 text-sm text-cyber-cyan-100 outline-none focus:border-cyber-cyan-400"
            />
          </label>
          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={cargando}
            className="min-h-12 w-full rounded-md bg-cyber-cyan-500 text-sm font-bold text-white hover:bg-cyber-cyan-400 disabled:opacity-65"
          >
            {cargando ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      )}
    </section>
  );
}
