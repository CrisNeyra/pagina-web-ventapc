"use client";

import { useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import { validarPassword, MENSAJE_REQUISITOS_PASSWORD } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

type AuthMode = "login" | "registro" | "recuperar";

const EMAIL_RECORDADO_KEY = "aura_email_recordado";

interface AuthModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onAutenticado?: () => void;
  errorInicial?: string;
}

export default function AuthModal({
  abierto,
  onCerrar,
  onAutenticado,
  errorInicial = "",
}: AuthModalProps) {
  const [modo, setModo] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [enlaceDemo, setEnlaceDemo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const { configured, signIn, signUp } = useAuth();

  useEffect(() => {
    if (!abierto) return;
    const guardado = window.localStorage.getItem(EMAIL_RECORDADO_KEY) ?? "";
    setEmail(guardado);
    setRecordarme(Boolean(guardado));
    setError(errorInicial);
  }, [abierto, errorInicial]);

  if (!abierto) return null;

  const resetMensajes = () => {
    setError("");
    setOk("");
    setEnlaceDemo("");
  };

  const cerrar = () => {
    resetMensajes();
    setEmail("");
    setPassword("");
    setMostrarPassword(false);
    onCerrar();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMensajes();

    if (!configured) {
      setError("Falta configurar la base. Definí DATABASE_URL (Neon) en .env.local.");
      return;
    }

    if (modo === "registro" && !validarPassword(password)) {
      setError(MENSAJE_REQUISITOS_PASSWORD);
      return;
    }

    if (modo !== "recuperar" && !password.trim()) {
      setError("Ingresá tu contraseña.");
      return;
    }

    setCargando(true);

    try {
      if (modo === "recuperar") {
        const respuesta = await fetch("/api/auth/forgot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const datos = (await respuesta.json().catch(() => ({}))) as {
          message?: string;
          enlace?: string;
        };
        if (!respuesta.ok) {
          setError(datos.message || "No se pudo enviar el enlace.");
          return;
        }
        setOk(datos.message || "Si el correo está registrado, te enviamos un enlace.");
        if (datos.enlace) setEnlaceDemo(datos.enlace);
        return;
      }

      if (modo === "registro") {
        const signUpError = await signUp(email, password);
        if (signUpError) {
          if (signUpError.includes("Usuario creado")) {
            setOk(signUpError);
          } else {
            setError(signUpError);
          }
          return;
        }

        setOk("Registro exitoso. Sesión iniciada con la API.");
        onAutenticado?.();
        window.setTimeout(() => cerrar(), 350);
        return;
      }

      const loginError = await signIn(email, password, recordarme);
      if (loginError) {
        setError(loginError);
        return;
      }

      if (recordarme) {
        window.localStorage.setItem(EMAIL_RECORDADO_KEY, email.trim());
      } else {
        window.localStorage.removeItem(EMAIL_RECORDADO_KEY);
      }

      setOk("Sesión iniciada correctamente.");
      onAutenticado?.();
      window.setTimeout(() => cerrar(), 350);
    } catch (error) {
      console.error("Error inesperado en flujo de autenticación:", error);
      setError("Ocurrió un error inesperado. Revisá la consola para más detalles.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 px-3 py-0 sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Autenticación"
    >
      <div className="max-h-[min(92dvh,640px)] w-full max-w-md overflow-y-auto rounded-t-2xl border border-cyber-purple-500/40 bg-oscuro-900 p-5 shadow-[0_0_30px_rgba(168,85,247,0.25)] sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {modo === "login"
                ? "Iniciar sesión"
                : modo === "registro"
                  ? "Crear cuenta"
                  : "Recuperar contraseña"}
            </h3>
            <p className="mt-1 text-xs text-cyber-cyan-200/80">
              {MENSAJE_REQUISITOS_PASSWORD}
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
              autoComplete="email"
              className="min-h-11 w-full rounded-md border border-cyber-purple-500/45 bg-oscuro-950 px-3 py-2 text-sm text-cyber-cyan-100 outline-none focus:border-cyber-cyan-400 focus:ring-2 focus:ring-cyber-cyan-500/40"
              placeholder="tuemail@dominio.com"
            />
          </label>

          {modo !== "recuperar" && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cyber-cyan-200">
              Contraseña
            </span>
            <div className="relative">
              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={modo === "registro" ? 10 : 1}
                maxLength={72}
                required
                autoComplete={modo === "login" ? "current-password" : "new-password"}
                className="min-h-11 w-full rounded-md border border-cyber-purple-500/45 bg-oscuro-950 px-3 py-2 pr-10 text-sm text-cyber-cyan-100 outline-none focus:border-cyber-cyan-400 focus:ring-2 focus:ring-cyber-cyan-500/40"
                placeholder="Mínimo 10 caracteres"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((prev) => !prev)}
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-cyber-cyan-200/80 hover:text-cyber-cyan-100"
              >
                {mostrarPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </label>
          )}

          {modo === "login" && (
            <label className="flex items-center gap-2 text-xs text-cyber-cyan-200">
              <input
                type="checkbox"
                checked={recordarme}
                onChange={(e) => setRecordarme(e.target.checked)}
                className="h-4 w-4 accent-cyber-cyan-400"
              />
              Recordarme
            </label>
          )}

          {modo === "login" && (
            <button
              type="button"
              onClick={() => {
                setModo("recuperar");
                resetMensajes();
              }}
              className="text-xs font-semibold text-cyber-cyan-300 underline-offset-2 hover:underline"
            >
              Olvidé mi contraseña
            </button>
          )}

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
          {ok && (
            <p className="rounded-md border border-cyber-lime-400/30 bg-cyber-lime-400/10 px-3 py-2 text-xs text-cyber-lime-400">
              {ok}
              {enlaceDemo && (
                <>
                  {" "}
                  <a href={enlaceDemo} className="font-semibold underline">
                    Abrir enlace
                  </a>
                </>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-1 min-h-12 w-full rounded-md bg-cyber-cyan-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cyber-cyan-400 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {cargando
              ? "Procesando..."
              : modo === "login"
              ? "Ingresar"
              : modo === "registro"
              ? "Registrarme"
              : "Enviar enlace"}
          </button>
        </form>

        <div className="mt-4 border-t border-cyber-purple-400/40 pt-4">
          <p className="mb-2 text-center text-xs text-muted">
            {modo === "recuperar"
              ? "Si creaste la cuenta con Google, entrá directo. No hace falta una contraseña."
              : "O ingresá con tu cuenta de Google, sin crear una contraseña nueva."}
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.assign("/api/auth/google");
            }}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-[#747775] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1f1f] shadow-sm transition-colors hover:bg-[#f8f9fa]"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l6.3 5.3C37.4 38.4 44 33 44 24c0-1.2-.1-2.3-.4-3.5z" />
            </svg>
            Continuar con Google
          </button>
        </div>
      </div>
    </div>
  );
}
