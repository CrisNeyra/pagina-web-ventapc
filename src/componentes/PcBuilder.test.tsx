import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PcBuilder from "./PcBuilder";
import { useBuilderStore } from "@/store/builderStore";
import { defaultBuilderCategory } from "@/datos/pcBuilder";
import { builderProducts } from "@/datos/pcBuilder";
import { guardarBuildConReintentos } from "@/servicios/buildsPcServicio";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/servicios/buildsPcServicio", () => ({
  guardarBuildConReintentos: vi.fn(),
}));

import { useAuth } from "@/context/AuthContext";

const productoCpu = builderProducts.find((p) => p.categoria === "procesador")!;

const authMock = {
  user: null as { uid: string; email: string } | null,
  loading: false,
  configured: true,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
};

describe("PcBuilder", () => {
  beforeEach(() => {
    useBuilderStore.setState({
      categoriaActiva: defaultBuilderCategory,
      seleccion: {},
    });
    vi.clearAllMocks();
    authMock.user = null;
    vi.mocked(useAuth).mockReturnValue({ ...authMock });
  });

  it("muestra mensaje si intenta guardar sin estar autenticado", async () => {
    const user = userEvent.setup();
    useBuilderStore.setState({
      seleccion: { procesador: productoCpu },
    });

    render(<PcBuilder />);
    await user.click(screen.getByRole("button", { name: /guardar configuracion/i }));

    expect(
      screen.getByText(/inicia sesion para guardar esta configuracion/i)
    ).toBeInTheDocument();
    expect(guardarBuildConReintentos).not.toHaveBeenCalled();
  });

  it("muestra mensaje si no hay componentes seleccionados", async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({
      ...authMock,
      user: { uid: "user-123", email: "test@test.com" },
    });

    render(<PcBuilder />);
    await user.click(screen.getByRole("button", { name: /guardar configuracion/i }));

    expect(
      screen.getByText(/primero seleccioná al menos un componente/i)
    ).toBeInTheDocument();
    expect(guardarBuildConReintentos).not.toHaveBeenCalled();
  });

  it("guarda la configuración cuando hay usuario y componentes", async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({
      ...authMock,
      user: { uid: "user-123", email: "test@test.com" },
    });
    vi.mocked(guardarBuildConReintentos).mockResolvedValue({
      ok: true,
      mensaje: "Configuración guardada en la base de datos.",
    });

    useBuilderStore.setState({
      seleccion: { procesador: productoCpu },
    });

    render(<PcBuilder />);
    await user.click(screen.getByRole("button", { name: /guardar configuracion/i }));

    await waitFor(() => {
      expect(guardarBuildConReintentos).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-123",
          items: expect.arrayContaining([
            expect.objectContaining({ id: productoCpu.id }),
          ]),
        })
      );
    });

    expect(
      screen.getByText(/configuración guardada en la base de datos/i)
    ).toBeInTheDocument();
  });
});
