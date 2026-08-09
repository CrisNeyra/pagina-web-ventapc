import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "./cartStore";

const productoMock = {
  id: "gpu-001",
  nombre: "RTX 4070",
  precio: 899999,
  imagen: "/productos/gpu-001-principal.jpg",
  enStock: true,
};

const productoMock2 = {
  id: "ram-001",
  nombre: "RAM 16GB",
  precio: 89999,
  imagen: "/productos/ram-001-principal.jpg",
  enStock: true,
};

describe("cartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], totalItems: 0, subtotal: 0 });
    localStorage.clear();
  });

  it("agrega un producto al carrito vacío", () => {
    useCartStore.getState().addItem(productoMock);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].producto.id).toBe("gpu-001");
    expect(state.items[0].cantidad).toBe(1);
    expect(state.totalItems).toBe(1);
    expect(state.subtotal).toBe(899999);
  });

  it("incrementa cantidad si el producto ya existe", () => {
    const { addItem } = useCartStore.getState();
    addItem(productoMock);
    addItem(productoMock, 2);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].cantidad).toBe(3);
    expect(state.totalItems).toBe(3);
    expect(state.subtotal).toBe(899999 * 3);
  });

  it("elimina un producto del carrito", () => {
    const { addItem, removeItem } = useCartStore.getState();
    addItem(productoMock);
    addItem(productoMock2);
    removeItem("gpu-001");

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].producto.id).toBe("ram-001");
    expect(state.subtotal).toBe(89999);
  });

  it("actualiza la cantidad de un producto", () => {
    const { addItem, updateQuantity } = useCartStore.getState();
    addItem(productoMock);
    updateQuantity("gpu-001", 5);

    const state = useCartStore.getState();
    expect(state.items[0].cantidad).toBe(5);
    expect(state.totalItems).toBe(5);
    expect(state.subtotal).toBe(899999 * 5);
  });

  it("no permite cantidad menor a 1 al actualizar", () => {
    const { addItem, updateQuantity } = useCartStore.getState();
    addItem(productoMock);
    updateQuantity("gpu-001", 0);

    expect(useCartStore.getState().items[0].cantidad).toBe(1);
  });

  it("no agrega productos sin stock", () => {
    const agregado = useCartStore.getState().addItem({
      ...productoMock,
      enStock: false,
    });

    expect(agregado).toBe(false);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("limpia el carrito por completo", () => {
    const { addItem, clearCart } = useCartStore.getState();
    addItem(productoMock);
    addItem(productoMock2);
    clearCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.subtotal).toBe(0);
  });
});
