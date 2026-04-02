import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let clienteSupabase: SupabaseClient | null = null;

export function obtenerClienteSupabase(): SupabaseClient | null {
  const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveAnonimaSupabase = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!urlSupabase || !claveAnonimaSupabase) {
    return null;
  }

  if (!clienteSupabase) {
    clienteSupabase = createClient(urlSupabase, claveAnonimaSupabase, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return clienteSupabase;
}
