import type { MetadataRoute } from "next";
import { urlSitio } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = urlSitio();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/checkout", "/usuario", "/restablecer"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
