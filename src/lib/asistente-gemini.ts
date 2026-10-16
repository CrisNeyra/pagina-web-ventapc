import { prisma } from "@/lib/prisma";
import { MARGEN_FUENTE_W } from "@/datos/especificacionesPc";

const REGLAS_COMPATIBILIDAD = `
Reglas de compatibilidad de Aura Pro (Armá tu PC):
- El socket del procesador tiene que coincidir con el de la mother.
- La memoria DDR tiene que coincidir con la de la mother.
- El cooler tiene que listar el socket del procesador.
- El gabinete tiene que aceptar el factor de forma de la mother.
- La fuente tiene que cubrir el consumo de CPU + GPU más ${MARGEN_FUENTE_W} W de margen. Si no alcanza, decilo.
`.trim();

export function asistenteConfigurado(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function modeloGemini(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

export async function textoCatalogo(): Promise<string> {
  const productos = await prisma.product.findMany({
    orderBy: { nombre: "asc" },
    take: 120,
    select: {
      nombre: true,
      precio: true,
      stock: true,
      enStock: true,
      categoria: true,
      descripcion: true,
      specs: true,
    },
  });

  return productos
    .map((producto) => {
      const detalle = producto.descripcion.replace(/\s+/g, " ").slice(0, 180);
      const specs = producto.specs ? JSON.stringify(producto.specs) : "{}";
      return [
        `- ${producto.nombre}`,
        `categoria=${producto.categoria}`,
        `precioARS=${producto.precio}`,
        `stock=${producto.stock}`,
        `enStock=${producto.enStock}`,
        `detalle=${detalle}`,
        `specs=${specs}`,
      ].join(" | ");
    })
    .join("\n")
    .slice(0, 14_000);
}

export function extraerTextoGemini(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("candidates" in body)) return null;
  const candidates = (body as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || !candidates[0] || typeof candidates[0] !== "object") {
    return null;
  }
  const content = (candidates[0] as { content?: { parts?: { text?: string }[] } }).content;
  const texto = content?.parts?.map((parte) => parte.text ?? "").join("").trim();
  return texto || null;
}

export async function consultarGemini(mensaje: string, catalogo: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("ASISTENTE_NO_CONFIGURADO");

  const respuesta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modeloGemini())}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: [
                "Sos el asesor de Aura Pro, una tienda de hardware gamer en Argentina.",
                "Respondé en español, breve y claro.",
                "Usá solo el catálogo de abajo para stock, precios y fichas. Si el producto no está, decilo. No inventes stock ni precios.",
                "Los precios están en pesos argentinos.",
                REGLAS_COMPATIBILIDAD,
                "Catálogo:",
                catalogo || "No hay productos cargados.",
              ].join("\n"),
            },
          ],
        },
        contents: [{ role: "user", parts: [{ text: mensaje }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
      }),
      cache: "no-store",
    }
  );

  const body = (await respuesta.json().catch(() => null)) as unknown;
  if (!respuesta.ok) {
    throw new Error("ASISTENTE_ERROR");
  }
  const texto = extraerTextoGemini(body);
  if (!texto) throw new Error("ASISTENTE_VACIO");
  return texto;
}
