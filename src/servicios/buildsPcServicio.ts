import type { SupabaseClient } from "@supabase/supabase-js";
import type { BaseDatosSupabase } from "@/tipos/baseDatosSupabase";

interface ItemBuild {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
}

interface DatosBuild {
  user_id: string;
  subtotal: number;
  items: ItemBuild[];
}

interface ResultadoGuardadoBuild {
  ok: boolean;
  mensaje: string;
}

async function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function guardarBuildConReintentos(
  clienteSupabase: SupabaseClient<BaseDatosSupabase>,
  datosBuild: DatosBuild
): Promise<ResultadoGuardadoBuild> {
  const maximoIntentos = 3;

  for (let intento = 1; intento <= maximoIntentos; intento += 1) {
    const { error } = await clienteSupabase.from("pc_builds").insert(datosBuild);

    if (!error) {
      return {
        ok: true,
        mensaje: "Configuración guardada en la base de datos.",
      };
    }

    const esUltimoIntento = intento === maximoIntentos;
    if (esUltimoIntento) {
      return {
        ok: false,
        mensaje:
          "No se pudo guardar la build. Verificá la tabla pc_builds, RLS y variables de entorno.",
      };
    }

    await esperar(350 * intento);
  }

  return {
    ok: false,
    mensaje: "No se pudo guardar la build por un error inesperado.",
  };
}
