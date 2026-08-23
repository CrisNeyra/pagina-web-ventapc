import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://pagina-web-ventapc.vercel.app";
  const rutas = [
    "",
    "/productos",
    "/notebooks",
    "/arma-tu-pc",
    "/checkout",
    "/usuario",
    "/ayuda",
    "/privacidad",
    "/arrepentimiento",
    "/terminos",
    "/trabaja-con-nosotros",
  ];

  return rutas.map((ruta) => ({
    url: `${base}${ruta}`,
    lastModified: new Date(),
    changeFrequency: ruta === "" ? "daily" : "weekly",
    priority: ruta === "" ? 1 : 0.7,
  }));
}
