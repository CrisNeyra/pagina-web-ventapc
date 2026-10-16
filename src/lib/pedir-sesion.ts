import { toast } from "sonner";

export const EVENTO_AUTH_REQUERIDA = "aura-auth-requerida";

export function pedirInicioSesion(mensaje = "Iniciá sesión para agregar al carrito.") {
  toast.error(mensaje);
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENTO_AUTH_REQUERIDA));
}
