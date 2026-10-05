import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
};

const sentryAuth = Boolean(process.env.SENTRY_AUTH_TOKEN?.trim());

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: { disable: !sentryAuth },
  widenClientFileUpload: sentryAuth,
});
