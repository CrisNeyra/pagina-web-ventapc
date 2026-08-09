import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductCard from "./ProductCard";
import { useCartStore } from "@/store/cartStore";
import type { Producto } from "@/tipos/producto";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const productoMock: Producto = {
  id: "gpu-001",
  nombre: "NVIDIA GeForce RTX 4070",
  descripcion: "Placa de video de alto rendimiento.",
  precio: 899999,
  imagenes: ["/productos/gpu-001-principal.jpg"],
  categoria: "GPU",
  enStock: true,
};

describe("ProductCard", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], totalItems: 0, subtotal: 0 });
    vi.clearAllMocks();
  });

  it("renderiza nombre y precio del producto", () => {
    render(<ProductCard producto={productoMock} />);

    expect(screen.getByText("NVIDIA GeForce RTX 4070")).toBeInTheDocument();
    expect(screen.getByText(/899/)).toBeInTheDocument();
  });

  it("agrega el producto al carrito al hacer click", async () => {
    const user = userEvent.setup();
    render(<ProductCard producto={productoMock} />);

    await user.click(screen.getByRole("button", { name: /agregar al carrito/i }));

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].producto.id).toBe("gpu-001");
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("NVIDIA GeForce RTX 4070")
    );
  });

  it("muestra error si el producto no tiene stock", async () => {
    const user = userEvent.setup();
    const sinStock = { ...productoMock, enStock: false };
    render(<ProductCard producto={sinStock} />);

    await user.click(screen.getByRole("button", { name: /agregar al carrito/i }));

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(toast.error).toHaveBeenCalledWith(
      "Este producto no tiene stock disponible."
    );
  });
});
