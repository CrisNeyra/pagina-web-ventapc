"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
import { validarPassword } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

type AuthMode = "login" | "registro";

interface AuthModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onAutenticado?: () => void;
}

export default function AuthModal({
  abierto,
  onCerrar,
  onAutenticado,
}: AuthModalProps) {
  const [modo, setModo] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [cargando, setCargando] = useState(false);
  const { configured, signIn, signUp } = useAuth();

  if (!abierto) return null;

  const resetMensajes = () => {
    setError("");
    setOk("");
  };

  const cerrar = () => {
    resetMensajes();
    setEmail("");
    setPassword("");
    onCerrar();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMensajes();

    if (!configured) {
      setError(
        "Falta configurar Supabase. Cargá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local."
      );
      return;
    }

    if (!validarPassword(password)) {
      setError(
        "La contraseña debe tener exactamente 6 caracteres: 4 números y 2 letras."
      );
      return;
    }

    setCargando(true);

    try {
      if (modo === "registro") {
        const signUpError = await signUp(email, password);
        if (signUpError) {
          setError(signUpError);
          return;
        }

        setOk(
          "Registro exitoso. Revisá tu correo para confirmar la cuenta (si la confirmación está activa)."
        );
        return;
      }

      const loginError = await signIn(email, password);
      if (loginError) {
        setError(loginError);
        return;
      }

      setOk("Sesión iniciada correctamente.");
      onAutenticado?.();
      window.setTimeout(() => cerrar(), 350);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Autenticación"
    >
      <div className="w-full max-w-md rounded-2xl border border-cyber-purple-500/40 bg-oscuro-900 p-5 shadow-[0_0_30px_rgba(168,85,247,0.25)]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </h3>
            <p className="mt-1 text-xs text-cyber-cyan-200/80">
              Contraseña requerida: 4 números + 2 letras (6 caracteres).
            </p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar modal"
            className="rounded-md p-1.5 text-cyber-cyan-200/80 hover:bg-oscuro-800 hover:text-cyber-cyan-100"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="mb-4 flex rounded-md border border-cyber-purple-500/35 bg-oscuro-800 p-1">
          <button
            type="button"
            onClick={() => {
              setModo("login");
              resetMensajes();
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              modo === "login"
                ? "bg-cyber-purple-500 text-white"
                : "text-cyber-cyan-200/80 hover:bg-oscuro-700"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setModo("registro");
              resetMensajes();
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              modo === "registro"
                ? "bg-cyber-purple-500 text-white"
                : "text-cyber-cyan-200/80 hover:bg-oscuro-700"
            }`}
          >
            Registro
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cyber-cyan-200">
              Correo electrónico
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-cyber-purple-500/45 bg-oscuro-950 px-3 py-2 text-sm text-cyber-cyan-100 outline-none focus:border-cyber-cyan-400 focus:ring-2 focus:ring-cyber-cyan-500/40"
              placeholder="tuemail@dominio.com"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cyber-cyan-200">
              Contraseña
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              maxLength={6}
              required
              className="w-full rounded-md border border-cyber-purple-500/45 bg-oscuro-950 px-3 py-2 text-sm text-cyber-cyan-100 outline-none focus:border-cyber-cyan-400 focus:ring-2 focus:ring-cyber-cyan-500/40"
              placeholder="Ej: 1234ab"
            />
          </label>

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
          {ok && (
            <p className="rounded-md border border-cyber-lime-400/30 bg-cyber-lime-400/10 px-3 py-2 text-xs text-cyber-lime-400">
              {ok}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-1 w-full rounded-md bg-cyber-cyan-500 px-4 py-2.5 text-sm font-bold text-oscuro-950 transition-colors hover:bg-cyber-cyan-400 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {cargando
              ? "Procesando..."
              : modo === "login"
              ? "Ingresar"
              : "Registrarme"}
          </button>
        </form>
      </div>
    </div>
  );
}
