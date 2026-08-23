"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as cerrarSesionFirebase,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";
import { obtenerAuthFirebase } from "@/configuracion/firebase";
import { apiConfigurada } from "@/lib/api-client";
import { authModeEsNest } from "@/lib/auth-mode";
import { capturarError } from "@/lib/observabilidad";
import { guardarApiToken, limpiarApiToken, obtenerApiToken } from "@/lib/api-token";
import {
  intercambiarTokenFirebase,
  loginUsuarioApi,
  obtenerUsuarioApi,
  registrarUsuarioApi,
} from "@/servicios/apiBackendServicio";
import type { AuthUser } from "@/tipos/auth-user";

async function sincronizarCookieFirebase(idToken: string | null) {
  try {
    if (idToken) {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      return;
    }
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch {
    // Firebase Admin puede no estar configurado en local.
  }
}

async function sincronizarCookieJwt(token: string | null) {
  try {
    if (token) {
      await fetch("/api/auth/api-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      return;
    }
    await fetch("/api/auth/api-session", { method: "DELETE" });
  } catch {
    // Ignorar en local si la ruta falla.
  }
}

function mapearUsuarioNest(user: { id: string; email: string; role: string }): AuthUser {
  return { uid: user.id, email: user.email, role: user.role };
}

function mensajeAuthFirebase(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return "Ocurrió un error inesperado de autenticación.";
  }

  switch (error.code) {
    case "auth/invalid-email":
      return "El email no es válido.";
    case "auth/email-already-in-use":
      return "Este email ya está registrado.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email o contraseña incorrectos.";
    case "auth/weak-password":
      return "La contraseña no cumple los requisitos mínimos.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intentá nuevamente en unos minutos.";
    default:
      return error.message || "Error de autenticación.";
  }
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
  return msg || "Error de autenticación.";
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
  authMode: "firebase" | "nest";
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const modoNest = authModeEsNest();
  const authFirebase = useMemo(
    () => (modoNest ? null : obtenerAuthFirebase()),
    [modoNest]
  );

  const configured = modoNest ? apiConfigurada() : Boolean(authFirebase);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!modoNest) return;

    let cancelado = false;

    async function restaurarSesionNest() {
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

    void restaurarSesionNest();
    return () => {
      cancelado = true;
    };
  }, [modoNest]);

  useEffect(() => {
    if (modoNest || !authFirebase) return;

    const unsubscribe = onAuthStateChanged(
      authFirebase,
      (usuarioActual) => {
        if (!usuarioActual) {
          setUser(null);
          setLoading(false);
          void sincronizarCookieFirebase(null);
          limpiarApiToken();
          void sincronizarCookieJwt(null);
          return;
        }

        setUser({
          uid: usuarioActual.uid,
          email: usuarioActual.email,
        });
        setLoading(false);

        void (async () => {
          try {
            const idToken = await usuarioActual.getIdToken();
            await sincronizarCookieFirebase(idToken);

            if (apiConfigurada()) {
              try {
                const intercambio = await intercambiarTokenFirebase(idToken);
                guardarApiToken(intercambio.token);
                await sincronizarCookieJwt(intercambio.token);
                setUser({
                  uid: intercambio.user.id,
                  email: intercambio.user.email,
                  role: intercambio.user.role,
                });
              } catch (error) {
                void capturarError(error, { contexto: "firebase-exchange" });
                if (process.env.NODE_ENV !== "production") {
                  toast.warning(
                    "API configurada pero el exchange JWT falló. El checkout Nest puede pedir sesión."
                  );
                }
              }
            }
          } catch (error) {
            void capturarError(error, { contexto: "sincronizarSesionFirebase" });
          }
        })();
      },
      (error) => {
        void capturarError(error, { contexto: "onAuthStateChanged" });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [modoNest, authFirebase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (modoNest) {
        if (!apiConfigurada()) return "La API no está configurada (NEXT_PUBLIC_API_URL).";
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
      }

      if (!authFirebase) return "Firebase no está configurado.";
      try {
        await signInWithEmailAndPassword(authFirebase, email, password);
        return null;
      } catch (error) {
        void capturarError(error, { contexto: "signIn" });
        return mensajeAuthFirebase(error);
      }
    },
    [modoNest, authFirebase]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (modoNest) {
        if (!apiConfigurada()) return "La API no está configurada (NEXT_PUBLIC_API_URL).";
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
      }

      if (!authFirebase) return "Firebase no está configurado.";
      try {
        await createUserWithEmailAndPassword(authFirebase, email, password);
        return null;
      } catch (error) {
        void capturarError(error, { contexto: "signUp" });
        return mensajeAuthFirebase(error);
      }
    },
    [modoNest, authFirebase]
  );

  const signOut = useCallback(async () => {
    if (modoNest) {
      limpiarApiToken();
      await sincronizarCookieJwt(null);
      setUser(null);
      return null;
    }

    if (!authFirebase) return "Firebase no está configurado.";
    try {
      await cerrarSesionFirebase(authFirebase);
      limpiarApiToken();
      await sincronizarCookieJwt(null);
      return null;
    } catch (error) {
      void capturarError(error, { contexto: "signOut" });
      return mensajeAuthFirebase(error);
    }
  }, [modoNest, authFirebase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured,
      authMode: modoNest ? "nest" : "firebase",
      signIn,
      signUp,
      signOut,
    }),
    [configured, loading, modoNest, signIn, signOut, signUp, user]
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
