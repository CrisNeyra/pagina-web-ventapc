import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductGalleryLightbox from "./ProductGalleryLightbox";

describe("ProductGalleryLightbox", () => {
  it("atrapa Tab dentro del diálogo y devuelve el foco al cerrar", async () => {
    const user = userEvent.setup();
    const abrir = document.createElement("button");
    abrir.textContent = "Abrir galería";
    document.body.appendChild(abrir);
    abrir.focus();

    const onCerrar = vi.fn();
    const { rerender } = render(
      <ProductGalleryLightbox
        abierto
        nombre="RTX 4070"
        imagenes={["/a.jpg", "/b.jpg"]}
        indice={0}
        onCerrar={onCerrar}
        onIndice={() => undefined}
      />
    );

    const cerrar = screen.getByRole("button", { name: "Cerrar galería" });
    expect(cerrar).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Ver foto 2" })).toHaveFocus();

    await user.tab();
    expect(cerrar).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(onCerrar).toHaveBeenCalledOnce();

    rerender(
      <ProductGalleryLightbox
        abierto={false}
        nombre="RTX 4070"
        imagenes={["/a.jpg", "/b.jpg"]}
        indice={0}
        onCerrar={onCerrar}
        onIndice={() => undefined}
      />
    );

    expect(abrir).toHaveFocus();
    abrir.remove();
  });
});
