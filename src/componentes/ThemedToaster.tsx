"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/context/ThemeContext";

export default function ThemedToaster() {
  const { theme } = useTheme();

  return <Toaster position="bottom-center" richColors theme={theme} />;
}
