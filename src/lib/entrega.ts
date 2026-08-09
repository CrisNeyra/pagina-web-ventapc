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

export function costoEntrega(tipo: TipoEntrega): number {
  return tipo === "envio" ? COSTO_ENVIO_PESOS : 0;
}
