export type TipoEntrega = "retiro" | "envio";

export interface DatosEnvio {
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  telefonoContacto: string;
}

export interface DatosEntrega {
  tipo: TipoEntrega;
  envio?: DatosEnvio;
}

export const COSTO_ENVIO_PESOS = 5000;

export function validarDatosEntrega(datos: DatosEntrega): { ok: true } | { ok: false; error: string } {
  if (datos.tipo === "retiro") {
    return { ok: true };
  }

  const envio = datos.envio;
  if (!envio) {
    return { ok: false, error: "Completá los datos de envío." };
  }

  if (!envio.direccion.trim() || !envio.ciudad.trim() || !envio.codigoPostal.trim()) {
    return { ok: false, error: "Dirección, ciudad y código postal son obligatorios." };
  }

  if (!envio.telefonoContacto.trim()) {
    return { ok: false, error: "Indicá un teléfono de contacto para el envío." };
  }

  return { ok: true };
}

export async function cotizarEnvio(codigoPostal?: string): Promise<number> {
  if (!codigoPostal?.trim()) return COSTO_ENVIO_PESOS;

  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    try {
      const { cotizarEnvioApi } = await import("@/servicios/apiBackendServicio");
      const cotizacion = await cotizarEnvioApi(codigoPostal);
      return cotizacion.costo;
    } catch {
      return COSTO_ENVIO_PESOS;
    }
  }

  return COSTO_ENVIO_PESOS;
}

export function costoEntrega(tipo: TipoEntrega, costoDinamico = COSTO_ENVIO_PESOS): number {
  return tipo === "envio" ? costoDinamico : 0;
}
