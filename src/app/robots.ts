import type { MetadataRoute } from "next";

function baseSite(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) return site.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "https://pagina-web-ventapc.vercel.app";
}

export default function robots(): MetadataRoute.Robots {
  const base = baseSite();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/checkout", "/usuario"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
