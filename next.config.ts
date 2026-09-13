import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // bcrypt / Prisma nativos en Route Handlers (Vercel Node runtime)
  serverExternalPackages: ["bcrypt", "@prisma/client", "prisma"],
};

export default nextConfig;
