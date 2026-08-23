import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { catalogoCompleto } from "../src/datos/productos";

const destino = resolve("api/prisma/seed-data.json");

const datos = catalogoCompleto.map((p) => ({
  id: p.id,
  nombre: p.nombre,
  descripcion: p.descripcion,
  precio: p.precio,
  categoria: p.categoria,
  enStock: p.enStock,
  imagenes: p.imagenes,
  etiqueta: p.etiqueta,
}));

writeFileSync(destino, JSON.stringify(datos, null, 2));
console.log(`Exportados ${datos.length} productos → ${destino}`);
