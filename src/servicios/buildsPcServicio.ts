import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { obtenerFirestoreDb } from "@/configuracion/firebase";

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
  datosBuild: DatosBuild
): Promise<ResultadoGuardadoBuild> {
  const db = obtenerFirestoreDb();
  if (!db) {
    return {
      ok: false,
      mensaje: "Configura Firebase para guardar builds en base de datos real.",
    };
  }

  const maximoIntentos = 3;

  for (let intento = 1; intento <= maximoIntentos; intento += 1) {
    try {
      await addDoc(collection(db, "pc_builds"), {
        ...datosBuild,
        created_at: serverTimestamp(),
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
            "No se pudo guardar la build. Verifica Firestore, reglas de seguridad y variables de entorno.",
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
