// Formatea un número a precio argentino: $389.999
export function formatearPrecio(precio: number): string {
  return precio.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// Calcula el porcentaje de descuento entre precio anterior y actual
export function calcularDescuento(
  precioActual: number,
  precioAnterior: number
): number {
  return Math.round(((precioAnterior - precioActual) / precioAnterior) * 100);
}
