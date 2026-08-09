import { describe, it, expect } from "vitest";
import {
  filtrarProductosPorNombre,
  filtrarProductosNotebooks,
  unificarCatalogo,
} from "./productos";
import type { Producto } from "@/tipos/producto";

const productoBase = (id: string, nombre: string, categoria: string): Producto => ({
  id,
  nombre,
  descripcion: "Descripción de prueba",
  precio: 1000,
  imagenes: [`/productos/${id}-principal.jpg`],
  categoria,
  enStock: true,
});

describe("unificarCatalogo", () => {
  it("elimina duplicados por id", () => {
    const a = productoBase("gpu-001", "GPU A", "GPU");
    const b = productoBase("gpu-001", "GPU A duplicada", "GPU");
    const c = productoBase("ram-001", "RAM", "RAM");

    const resultado = unificarCatalogo([a, b], [c]);
    expect(resultado).toHaveLength(2);
    expect(resultado.map((p) => p.id)).toEqual(["gpu-001", "ram-001"]);
  });
});

describe("filtrarProductosPorNombre", () => {
  const productos = [
    productoBase("gpu-001", "NVIDIA RTX 4070", "GPU"),
    productoBase("ram-001", "Kingston Fury", "RAM"),
  ];

  it("devuelve todos si el término está vacío", () => {
    expect(filtrarProductosPorNombre(productos, "")).toHaveLength(2);
  });

  it("filtra por nombre sin distinguir mayúsculas", () => {
    const resultado = filtrarProductosPorNombre(productos, "rtx");
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("gpu-001");
  });
});

describe("filtrarProductosNotebooks", () => {
  it("solo devuelve productos de categoría notebook", () => {
    const productos = [
      productoBase("nb-001", "Notebook Gamer", "Notebooks"),
      productoBase("gpu-001", "GPU", "GPU"),
    ];

    const resultado = filtrarProductosNotebooks(productos);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("nb-001");
  });
});
