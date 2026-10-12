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
import { urlSitio } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sitio = urlSitio();
const descripcionSitio =
  "Tienda argentina de hardware gamer: placas de video, procesadores, notebooks, RAM y periféricos. Envíos a todo el país. Pagos con Mercado Pago, transferencia o efectivo.";

export const metadata: Metadata = {
  metadataBase: new URL(sitio),
  title: {
    default: "Aura Pro | Componentes de PC y hardware gamer",
    template: "%s | Aura Pro",
  },
  description: descripcionSitio,
  keywords: [
    "hardware gamer",
    "componentes PC",
    "placas de video",
    "notebooks",
    "Argentina",
    "Aura Pro",
  ],
  authors: [{ name: "Aura Pro" }],
  openGraph: {
    title: "Aura Pro | Hardware gamer",
    description: descripcionSitio,
    url: sitio,
    siteName: "Aura Pro",
    locale: "es_AR",
    type: "website",
    images: [{ url: "/logo.jpg", width: 512, height: 512, alt: "Aura Pro" }],
  },
  twitter: {
    card: "summary",
    title: "Aura Pro | Hardware gamer",
    description: descripcionSitio,
    images: ["/logo.jpg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: sitio },
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
      <body className="flex min-h-full flex-col bg-oscuro-950 text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Aura Pro",
              url: sitio,
              description: descripcionSitio,
              image: `${sitio}/logo.jpg`,
              address: {
                "@type": "PostalAddress",
                streetAddress: "Av. Corrientes 1234",
                addressLocality: "CABA",
                addressCountry: "AR",
              },
              paymentAccepted: "Cash, BankTransfer, Mercado Pago",
            }),
          }}
        />
        <AuthProvider>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-ink focus:shadow-lg"
          >
            Saltar al contenido
          </a>
          <DevConfigBanner />
          <Navbar />
          <div id="contenido" className="flex flex-1 flex-col">
            {children}
          </div>
          <Footer />
          <FloatingWhatsApp />
          <WelcomeBannerModal />
          <Toaster position="bottom-center" richColors theme="light" />
        </AuthProvider>
      </body>
    </html>
  );
}
