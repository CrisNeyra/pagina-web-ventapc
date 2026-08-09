import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { preciosCatalogo } from "../src/datos/preciosCatalogo";

const destino = resolve("functions/catalogoPrecios.json");
writeFileSync(destino, JSON.stringify(preciosCatalogo, null, 2));

console.log(
  `Catálogo sincronizado: ${Object.keys(preciosCatalogo).length} productos → ${destino}`
);
