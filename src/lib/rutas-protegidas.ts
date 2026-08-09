const RUTAS_PROTEGIDAS = ["/usuario", "/checkout"];

export function esRutaProtegida(pathname: string): boolean {
  if (pathname === "/checkout/exito" || pathname === "/checkout/error") {
    return false;
  }

  return RUTAS_PROTEGIDAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  );
}
