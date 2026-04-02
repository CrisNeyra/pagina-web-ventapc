import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProveedorRedux from "@/componentes/ProveedorRedux";
import Navbar from "@/componentes/Navbar";
import Footer from "@/componentes/Footer";
import FloatingWhatsApp from "@/componentes/FloatingWhatsApp";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

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
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-oscuro-950 text-cyber-cyan-100">
        <ProveedorRedux>
          <AuthProvider>
            <Navbar />
            {children}
            <Footer />
            <FloatingWhatsApp />
            <Toaster position="bottom-center" richColors theme="dark" />
          </AuthProvider>
        </ProveedorRedux>
      </body>
    </html>
  );
}
