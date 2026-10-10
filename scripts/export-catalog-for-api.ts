import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { catalogoCompleto } from "../src/datos/productos";

const destinos = [
  resolve("api/prisma/seed-data.json"),
  resolve("prisma/seed-data.json"),
];

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

const json = JSON.stringify(datos, null, 2);
for (const destino of destinos) {
  writeFileSync(destino, json);
  console.log(`Exportados ${datos.length} productos → ${destino}`);
}
