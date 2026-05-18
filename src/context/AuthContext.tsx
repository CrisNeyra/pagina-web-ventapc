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
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { obtenerAuthFirebase } from "@/configuracion/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mensajeAuthFirebase(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return "Ocurrio un error inesperado de autenticacion.";
  }

  switch (error.code) {
    case "auth/invalid-email":
      return "El email no es valido.";
    case "auth/email-already-in-use":
      return "Este email ya esta registrado.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email o contrasena incorrectos.";
    case "auth/weak-password":
      return "La contrasena no cumple los requisitos minimos.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intenta nuevamente en unos minutos.";
    default:
      return error.message || "Error de autenticacion.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useMemo(() => obtenerAuthFirebase(), []);
  const configured = Boolean(auth);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(
      auth,
      (usuarioActual) => {
        setUser(usuarioActual ?? null);
        setLoading(false);
      },
      (error) => {
        console.error("Error al escuchar cambios de autenticacion:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [auth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!auth) return "Firebase no esta configurado.";
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return null;
      } catch (error) {
        console.error("Error de login en Firebase:", error);
        return mensajeAuthFirebase(error);
      }
    },
    [auth]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!auth) return "Firebase no esta configurado.";
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        return null;
      } catch (error) {
        console.error("Error de registro en Firebase:", error);
        return mensajeAuthFirebase(error);
      }
    },
    [auth]
  );

  const signOut = useCallback(async () => {
    if (!auth) return "Firebase no esta configurado.";
    try {
      await cerrarSesionFirebase(auth);
      return null;
    } catch (error) {
      console.error("Error al cerrar sesion en Firebase:", error);
      return mensajeAuthFirebase(error);
    }
  }, [auth]);

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
