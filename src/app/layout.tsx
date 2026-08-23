import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/componentes/Navbar";
import Footer from "@/componentes/Footer";
import DevConfigBanner from "@/componentes/DevConfigBanner";
import FloatingWhatsApp from "@/componentes/FloatingWhatsApp";
import WelcomeBannerModal from "@/componentes/WelcomeBannerModal";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://pagina-web-ventapc.vercel.app"
  ),
  title: "Aura Pro | Componentes de PC & Hardware Gamer",
  description:
    "Aura Pro — tu tienda de confianza para hardware y componentes de PC de alta calidad. Placas de video, procesadores, memorias RAM y más.",
  openGraph: {
    title: "Aura Pro | Hardware Gamer",
    description: "Componentes de PC y periféricos gamer con envío a todo el país.",
    siteName: "Aura Pro",
    locale: "es_AR",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Aura Pro" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-oscuro-950 text-cyber-cyan-100">
        <AuthProvider>
          <DevConfigBanner />
          <Navbar />
          {children}
          <Footer />
          <FloatingWhatsApp />
          <WelcomeBannerModal />
          <Toaster position="bottom-center" richColors theme="dark" />
        </AuthProvider>
      </body>
    </html>
  );
}
