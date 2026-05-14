import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProveedorRedux from "@/componentes/ProveedorRedux";
import Navbar from "@/componentes/Navbar";
import Footer from "@/componentes/Footer";
import FloatingWhatsApp from "@/componentes/FloatingWhatsApp";
import WelcomeBannerModal from "@/componentes/WelcomeBannerModal";
import ThemedToaster from "@/componentes/ThemedToaster";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VentaPC | Componentes de PC & Hardware Gamer",
  description:
    "Tu tienda de confianza para hardware y componentes de PC de alta calidad. Placas de video, procesadores, memorias RAM y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const temaScript = `
    (function () {
      try {
        var guardado = localStorage.getItem("aurapro.theme");
        var sistemaOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var tema = guardado === "light" || guardado === "dark" ? guardado : (sistemaOscuro ? "dark" : "light");
        document.documentElement.dataset.theme = tema;
        document.documentElement.style.colorScheme = tema;
      } catch (e) {}
    })();
  `;

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ProveedorRedux>
          <ThemeProvider>
            <AuthProvider>
              <Navbar />
              {children}
              <Footer />
              <FloatingWhatsApp />
              <WelcomeBannerModal />
              <ThemedToaster />
            </AuthProvider>
          </ThemeProvider>
        </ProveedorRedux>
      </body>
    </html>
  );
}
