import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const docSet = vi.fn();
const archivoSave = vi.fn();

vi.mock("@/lib/firebase-admin", () => ({
  firebaseAdminConfigurado: vi.fn(() => true),
  obtenerFirestoreAdmin: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({ set: docSet })),
    })),
  })),
  obtenerStorageAdmin: vi.fn(() => ({
    bucket: vi.fn(() => ({
      file: vi.fn(() => ({ save: archivoSave })),
    })),
  })),
}));

import { POST as crearPostulacion } from "./route";

function crearFormData(
  opciones: {
    nombre?: string;
    email?: string;
    telefono?: string;
    cvTipo?: string;
    incluirCv?: boolean;
  } = {}
) {
  const formData = new FormData();
  formData.set("nombre", opciones.nombre ?? "Juan Pérez");
  formData.set("email", opciones.email ?? "juan@test.com");
  formData.set("telefono", opciones.telefono ?? "+54 11 5555-5555");
  formData.set("mensaje", "Quiero sumarme al equipo");

  if (opciones.incluirCv !== false) {
    const cv = new Blob(["contenido pdf"], {
      type: opciones.cvTipo ?? "application/pdf",
    });
    formData.set("cv", cv, "cv.pdf");
  }

  return formData;
}

function crearRequest(formData: FormData) {
  return {
    formData: async () => formData,
  } as unknown as NextRequest;
}

describe("POST /api/postulaciones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    docSet.mockResolvedValue(undefined);
    archivoSave.mockResolvedValue(undefined);
  });

  it("rechaza campos requeridos faltantes", async () => {
    const formData = crearFormData({
      nombre: "Juan",
      email: "",
      telefono: "",
    });

    const response = await crearPostulacion(crearRequest(formData));
    expect(response.status).toBe(400);
  });

  it("rechaza CV que no es PDF", async () => {
    const formData = crearFormData({ cvTipo: "image/png" });

    const response = await crearPostulacion(crearRequest(formData));
    expect(response.status).toBe(400);
  });

  it("guarda postulación válida", async () => {
    const response = await crearPostulacion(crearRequest(crearFormData()));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(docSet).toHaveBeenCalledOnce();
    expect(archivoSave).toHaveBeenCalledOnce();
  });
});
