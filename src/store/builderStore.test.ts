import { describe, it, expect, beforeEach } from "vitest";
import { calcularSubtotalBuilder, useBuilderStore } from "./builderStore";
import { defaultBuilderCategory } from "@/datos/pcBuilder";
import type { BuilderProduct } from "@/tipos/pcBuilder";

const productoCpu: BuilderProduct = {
  id: "b-cpu-001",
  categoria: "procesador",
  nombre: "AMD Ryzen 5",
  descripcion: "CPU de prueba",
  precio: 250000,
  imagen: "/productos/proc-001-principal.jpg",
  stock: true,
};

const productoGpu: BuilderProduct = {
  id: "b-gpu-001",
  categoria: "gpu",
  nombre: "RTX 4070",
  descripcion: "GPU de prueba",
  precio: 900000,
  imagen: "/productos/gpu-001-principal.jpg",
  stock: true,
};

describe("builderStore", () => {
  beforeEach(() => {
    useBuilderStore.setState({
      categoriaActiva: defaultBuilderCategory,
      seleccion: {},
    });
    localStorage.clear();
  });

  it("inicia con categoría procesador y selección vacía", () => {
    const state = useBuilderStore.getState();
    expect(state.categoriaActiva).toBe("procesador");
    expect(state.seleccion).toEqual({});
  });

  it("cambia la categoría activa", () => {
    useBuilderStore.getState().setCategoriaActiva("gpu");
    expect(useBuilderStore.getState().categoriaActiva).toBe("gpu");
  });

  it("selecciona un producto por categoría", () => {
    useBuilderStore.getState().seleccionarProducto(productoCpu);

    const seleccion = useBuilderStore.getState().seleccion;
    expect(seleccion.procesador?.id).toBe("b-cpu-001");
  });

  it("reemplaza el producto de una categoría al seleccionar otro", () => {
    const otroCpu: BuilderProduct = { ...productoCpu, id: "b-cpu-002", precio: 300000 };
    const { seleccionarProducto } = useBuilderStore.getState();
    seleccionarProducto(productoCpu);
    seleccionarProducto(otroCpu);

    expect(useBuilderStore.getState().seleccion.procesador?.id).toBe("b-cpu-002");
  });

  it("quita un producto de una categoría", () => {
    const { seleccionarProducto, quitarProducto } = useBuilderStore.getState();
    seleccionarProducto(productoCpu);
    quitarProducto("procesador");

    expect(useBuilderStore.getState().seleccion.procesador).toBeUndefined();
  });

  it("limpia toda la build", () => {
    const { seleccionarProducto, setCategoriaActiva, limpiarBuild } =
      useBuilderStore.getState();
    seleccionarProducto(productoCpu);
    seleccionarProducto(productoGpu);
    setCategoriaActiva("gpu");
    limpiarBuild();

    const state = useBuilderStore.getState();
    expect(state.seleccion).toEqual({});
    expect(state.categoriaActiva).toBe(defaultBuilderCategory);
  });
});

describe("calcularSubtotalBuilder", () => {
  it("retorna 0 con selección vacía", () => {
    expect(calcularSubtotalBuilder({})).toBe(0);
  });

  it("suma los precios de los productos seleccionados", () => {
    const subtotal = calcularSubtotalBuilder({
      procesador: productoCpu,
      gpu: productoGpu,
    });
    expect(subtotal).toBe(1150000);
  });
});
