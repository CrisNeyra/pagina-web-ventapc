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
