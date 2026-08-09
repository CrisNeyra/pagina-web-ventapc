export interface ItemPagoValidacion {
  id: string;
  precio: number;
  cantidad?: number;
}

export function validarItemsPagoBasicos(items: ItemPagoValidacion[]): boolean {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.every((item) => {
    const precio = Number(item?.precio ?? 0);
    const cantidad = Number(item?.cantidad ?? 1);
    return Boolean(item?.id) && precio > 0 && cantidad > 0;
  });
}

export function validarItemsContraCatalogo(
  items: ItemPagoValidacion[],
  catalogo: Record<string, number>
): { ok: true } | { ok: false; error: string } {
  if (!validarItemsPagoBasicos(items)) {
    return { ok: false, error: "INVALID_ITEMS" };
  }

  for (const item of items) {
    const precioCatalogo = catalogo[item.id];
    if (precioCatalogo === undefined) {
      return { ok: false, error: "UNKNOWN_PRODUCT" };
    }
    if (Number(item.precio) !== precioCatalogo) {
      return { ok: false, error: "PRICE_MISMATCH" };
    }
  }

  return { ok: true };
}

export function calcularMontoCentavos(items: ItemPagoValidacion[]): number {
  const subtotal = items.reduce((sum, item) => {
    const precio = Number(item.precio);
    const cantidad = Number(item.cantidad ?? 1);
    return sum + precio * cantidad;
  }, 0);
  return Math.round(subtotal * 100);
}
