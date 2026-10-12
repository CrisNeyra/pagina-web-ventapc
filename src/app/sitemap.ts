import type { MetadataRoute } from "next";
import { categorias } from "@/datos/navegacion";
import { databaseUrlConfigurada, prisma } from "@/lib/prisma";
import { urlSitio } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlSitio();
  const rutas = [
    "",
    "/productos",
    "/notebooks",
    "/arma-tu-pc",
    "/ayuda",
    "/privacidad",
    "/arrepentimiento",
    "/terminos",
    "/trabaja-con-nosotros",
    ...categorias.map((c) => c.href),
  ];

  const estaticas: MetadataRoute.Sitemap = rutas.map((ruta) => ({
    url: `${base}${ruta}`,
    lastModified: new Date(),
    changeFrequency: ruta === "" ? "daily" : "weekly",
    priority: ruta === "" ? 1 : ruta.startsWith("/categoria") ? 0.65 : 0.7,
  }));

  if (!databaseUrlConfigurada()) return estaticas;

  try {
    const productos = await prisma.product.findMany({
      select: { id: true, updatedAt: true },
      take: 500,
    });
    const deProductos: MetadataRoute.Sitemap = productos.map((p) => ({
      url: `${base}/producto/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    return [...estaticas, ...deProductos];
  } catch {
    return estaticas;
  }
}
