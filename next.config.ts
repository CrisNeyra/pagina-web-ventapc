import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permitir imágenes locales sin errores si no existen aún
    unoptimized: true,
  },
};

export default nextConfig;
