import type { MetadataRoute } from "next";
import { databaseUrlConfigurada, prisma } from "@/lib/prisma";

function baseSite(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) return site.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "https://pagina-web-ventapc.vercel.app";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseSite();
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
  ];

  const estaticas: MetadataRoute.Sitemap = rutas.map((ruta) => ({
    url: `${base}${ruta}`,
    lastModified: new Date(),
    changeFrequency: ruta === "" ? "daily" : "weekly",
    priority: ruta === "" ? 1 : 0.7,
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
