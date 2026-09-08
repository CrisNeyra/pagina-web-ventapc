"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiConfigurada } from "@/lib/api-client";
import { capturarError } from "@/lib/observabilidad";
import { guardarApiToken, limpiarApiToken, obtenerApiToken } from "@/lib/api-token";
import {
  loginUsuarioApi,
  obtenerUsuarioApi,
  registrarUsuarioApi,
} from "@/servicios/apiBackendServicio";
import type { AuthUser } from "@/tipos/auth-user";

async function sincronizarCookieJwt(token: string | null): Promise<boolean> {
  const intentar = async () => {
    if (token) {
      const respuesta = await fetch("/api/auth/api-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      return respuesta.ok;
    }
    const respuesta = await fetch("/api/auth/api-session", { method: "DELETE" });
    return respuesta.ok;
  };

  try {
    if (await intentar()) return true;
    await new Promise((r) => setTimeout(r, 200));
    return await intentar();
  } catch {
    return false;
  }
}

function mapearUsuarioNest(user: { id: string; email: string; role: string }): AuthUser {
  return { uid: user.id, email: user.email, role: user.role };
}

function mensajeAuthNest(error: unknown) {
  const msg = error instanceof Error ? error.message : "";
  if (msg.includes("EMAIL_YA_REGISTRADO") || msg.includes("409")) {
    return "Este email ya está registrado.";
  }
  if (
    msg.includes("CREDENCIALES_INVALIDAS") ||
    msg.includes("401") ||
    msg.includes("Unauthorized")
  ) {
    return "Email o contraseña incorrectos.";
  }
  if (msg.includes("API no respondió") || msg.includes("No se pudo conectar")) {
    return msg;
  }
  return msg || "Error de autenticación.";
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = apiConfigurada();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    let cancelado = false;

    async function restaurarSesion() {
      if (!configured) {
        if (!cancelado) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const token = obtenerApiToken();
      if (!token) {
        if (!cancelado) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const me = await obtenerUsuarioApi(token);
        if (!cancelado) {
          setUser(mapearUsuarioNest(me));
          await sincronizarCookieJwt(token);
        }
      } catch {
        limpiarApiToken();
        await sincronizarCookieJwt(null);
        if (!cancelado) setUser(null);
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    void restaurarSesion();
    return () => {
      cancelado = true;
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!apiConfigurada()) {
      return "La API no está configurada (NEXT_PUBLIC_API_URL).";
    }
    try {
      const resultado = await loginUsuarioApi(email, password);
      guardarApiToken(resultado.token);
      await sincronizarCookieJwt(resultado.token);
      setUser(mapearUsuarioNest(resultado.user));
      return null;
    } catch (error) {
      void capturarError(error, { contexto: "signInNest" });
      return mensajeAuthNest(error);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!apiConfigurada()) {
      return "La API no está configurada (NEXT_PUBLIC_API_URL).";
    }
    try {
      const resultado = await registrarUsuarioApi(email, password);
      guardarApiToken(resultado.token);
      await sincronizarCookieJwt(resultado.token);
      setUser(mapearUsuarioNest(resultado.user));
      return null;
    } catch (error) {
      void capturarError(error, { contexto: "signUpNest" });
      return mensajeAuthNest(error);
    }
  }, []);

  const signOut = useCallback(async () => {
    limpiarApiToken();
    await sincronizarCookieJwt(null);
    setUser(null);
    return null;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured,
      signIn,
      signUp,
      signOut,
    }),
    [configured, loading, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
