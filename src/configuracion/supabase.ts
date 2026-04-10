import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BaseDatosSupabase } from "@/tipos/baseDatosSupabase";
import { obtenerEntornoSupabase } from "@/configuracion/entornoSupabase";

let clienteSupabase: SupabaseClient<BaseDatosSupabase> | null = null;

export function obtenerClienteSupabase(): SupabaseClient<BaseDatosSupabase> | null {
  const entornoSupabase = obtenerEntornoSupabase();
  if (!entornoSupabase) {
    return null;
  }

  if (!clienteSupabase) {
    clienteSupabase = createClient<BaseDatosSupabase>(
      entornoSupabase.NEXT_PUBLIC_SUPABASE_URL,
      entornoSupabase.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
    );
  }

  return clienteSupabase;
}
