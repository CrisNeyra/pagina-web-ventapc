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

const MODELO_DEFECTO = "gemini-3.5-flash";
const CACHE_CATALOGO_MS = 60_000;

export function modeloGemini(): string {
  return process.env.GEMINI_MODEL?.trim() || MODELO_DEFECTO;
}

interface FilaCatalogo {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  enStock: boolean;
  categoria: string;
  descripcion: string;
  specs: unknown;
}

let cacheCatalogo: { hasta: number; filas: FilaCatalogo[] } | null = null;

function resumenSpecs(specs: unknown): string {
  if (!specs || typeof specs !== "object") return "";
  return Object.entries(specs as Record<string, unknown>)
    .slice(0, 6)
    .map(([clave, valor]) => `${clave}=${Array.isArray(valor) ? valor.join("/") : String(valor)}`)
    .join(", ");
}

export function armarTextoCatalogo(filas: FilaCatalogo[], mensaje: string): string {
  const tokens = mensaje
    .toLowerCase()
    .split(/[^a-záéíóúñ0-9]+/i)
    .filter((token) => token.length > 2);

  const indice = filas
    .map(
      (producto) =>
        `- ${producto.nombre} | ${producto.categoria} | $${producto.precio} | stock ${producto.enStock ? producto.stock : 0} | /producto/${producto.id}`
    )
    .join("\n");

  const detalle = filas
    .filter((producto) => {
      const texto = `${producto.nombre} ${producto.categoria}`.toLowerCase();
      return tokens.some((token) => texto.includes(token));
    })
    .slice(0, 8)
    .map((producto) => {
      const specs = resumenSpecs(producto.specs);
      const descripcion = producto.descripcion.replace(/\s+/g, " ").slice(0, 100);
      return `- ${producto.nombre} (/producto/${producto.id}): ${[specs, descripcion].filter(Boolean).join(". ")}`;
    })
    .join("\n");

  return [indice, detalle ? `Fichas relacionadas:\n${detalle}` : ""].filter(Boolean).join("\n").slice(0, 8_000);
}

export async function textoCatalogo(mensaje: string): Promise<string> {
  const ahora = Date.now();
  if (!cacheCatalogo || cacheCatalogo.hasta < ahora) {
    const filas = await prisma.product.findMany({
      orderBy: { nombre: "asc" },
      take: 120,
      select: {
        id: true,
        nombre: true,
        precio: true,
        stock: true,
        enStock: true,
        categoria: true,
        descripcion: true,
        specs: true,
      },
    });
    cacheCatalogo = { hasta: ahora + CACHE_CATALOGO_MS, filas };
  }

  return armarTextoCatalogo(cacheCatalogo.filas, mensaje);
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
                "Cuando nombres un producto del catálogo, incluí una sola vez el enlace markdown [nombre](/producto/id) con el id de esa línea.",
                "Los precios están en pesos argentinos.",
                REGLAS_COMPATIBILIDAD,
                "Catálogo:",
                catalogo || "No hay productos cargados.",
              ].join("\n"),
            },
          ],
        },
        contents: [{ role: "user", parts: [{ text: mensaje }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 350,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      cache: "no-store",
    }
  );

  const body = (await respuesta.json().catch(() => null)) as unknown;
  if (!respuesta.ok) {
    const mensajeError =
      body && typeof body === "object" && "error" in body
        ? String((body as { error?: { message?: string } }).error?.message ?? "").slice(0, 180)
        : "";
    console.error("Gemini", respuesta.status, mensajeError);
    throw new Error("ASISTENTE_ERROR");
  }
  const texto = extraerTextoGemini(body);
  if (!texto) throw new Error("ASISTENTE_VACIO");
  return texto;
}
