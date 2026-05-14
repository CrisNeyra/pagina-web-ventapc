"use client";

import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const esOscuro = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center rounded-full border border-cyber-purple-500/45 bg-oscuro-900/70 p-2 text-cyber-cyan-200/85 transition-all duration-200 hover:scale-[1.03] hover:text-cyber-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-purple-400 ${className}`}
      aria-label={esOscuro ? "Activar tema claro" : "Activar tema oscuro"}
      title={esOscuro ? "Activar tema claro" : "Activar tema oscuro"}
    >
      {esOscuro ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}
