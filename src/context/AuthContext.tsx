"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { obtenerClienteSupabase } from "@/configuracion/supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => obtenerClienteSupabase(), []);
  const configured = Boolean(supabase);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error al recuperar sesión de Supabase:", error);
        }
        if (!mounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error inesperado al recuperar sesión:", error);
        if (!mounted) return;
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return "Supabase no está configurado.";
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Error de login en Supabase:", error);
      }
      return error?.message ?? null;
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return "Supabase no está configurado.";
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Error de registro en Supabase:", error);
        return error.message;
      }

      if (!data.session) {
        const { error: loginAutomaticoError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (loginAutomaticoError) {
          console.error(
            "Registro exitoso pero no se pudo iniciar sesión automáticamente:",
            loginAutomaticoError
          );
          return "Usuario creado. Si no inicia sesión automáticamente, desactivá la confirmación por correo en Supabase Auth.";
        }
      }

      return null;
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (!supabase) return "Supabase no está configurado.";
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión en Supabase:", error);
    }
    return error?.message ?? null;
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      configured,
      signIn,
      signUp,
      signOut,
    }),
    [configured, loading, session, signIn, signOut, signUp, user]
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
