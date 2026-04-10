import { z } from "zod";

const esquemaEntornoSupabase = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

let advertenciaMostrada = false;

export function obtenerEntornoSupabase() {
  const validacion = esquemaEntornoSupabase.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!validacion.success) {
    if (!advertenciaMostrada && process.env.NODE_ENV !== "production") {
      console.warn(
        "Variables de Supabase faltantes o inválidas: revisá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      advertenciaMostrada = true;
    }
    return null;
  }

  return validacion.data;
}
