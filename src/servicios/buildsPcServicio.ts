import { apiConfigurada, apiFetch } from "@/lib/api-client";
import { obtenerApiToken } from "@/lib/api-token";

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

export async function guardarBuildEnApi(
  token: string,
  datos: { subtotal: number; items: ItemBuild[] }
) {
  return apiFetch<{ id: string }>("/pc-builds", {
    method: "POST",
    token,
    body: JSON.stringify({
      subtotal: datos.subtotal,
      items: datos.items,
    }),
  });
}

export async function guardarBuildConReintentos(
  datosBuild: DatosBuild
): Promise<ResultadoGuardadoBuild> {
  if (!apiConfigurada()) {
    return {
      ok: false,
      mensaje: "Configurá NEXT_PUBLIC_API_URL para guardar builds en la API.",
    };
  }

  const token = obtenerApiToken();
  if (!token) {
    return {
      ok: false,
      mensaje: "Iniciá sesión para guardar esta configuración.",
    };
  }

  const maximoIntentos = 3;

  for (let intento = 1; intento <= maximoIntentos; intento += 1) {
    try {
      await guardarBuildEnApi(token, {
        subtotal: datosBuild.subtotal,
        items: datosBuild.items,
      });
      return {
        ok: true,
        mensaje: "Configuración guardada en la base de datos.",
      };
    } catch {
      const esUltimoIntento = intento === maximoIntentos;
      if (esUltimoIntento) {
        return {
          ok: false,
          mensaje:
            "No se pudo guardar la build. Verificá que la API esté activa y que tengas sesión.",
        };
      }
    }

    await esperar(350 * intento);
  }

  return {
    ok: false,
    mensaje: "No se pudo guardar la build por un error inesperado.",
  };
}
