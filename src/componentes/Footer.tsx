import Link from "next/link";
import Image from "next/image";
import {
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiYoutube,
} from "react-icons/fi";
import { SiTwitch, SiTiktok } from "react-icons/si";
import { FiLinkedin } from "react-icons/fi";

const logosPagos = [
  { nombre: "Visa", src: "/assets/visa.svg" },
  { nombre: "Mastercard", src: "/assets/mastercard.svg" },
  { nombre: "American Express", src: "/assets/amex.svg" },
  { nombre: "Cabal", src: "/assets/cabal.svg" },
  { nombre: "Naranja", src: "/marcas/naranja.svg" },
  { nombre: "Mercado Pago", src: "/marcas/mercado-pago.svg" },
];

export default function Footer() {
  return (
    <footer className="bg-oscuro-950 border-t border-oscuro-700 mt-auto">
      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Columna 1: Links */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link
              href="/ayuda"
              className="border border-oscuro-700 text-gray-400 hover:bg-oscuro-800 hover:text-white
                         px-6 py-2 rounded text-sm font-medium transition-colors"
            >
              Ayuda
            </Link>
            <Link
              href="/arrepentimiento"
              className="border border-oscuro-700 text-gray-400 hover:bg-oscuro-800 hover:text-white
                         px-6 py-2 rounded text-sm font-medium transition-colors"
            >
              Botón de arrepentimiento
            </Link>
            <Link
              href="/terminos"
              className="text-sm text-gray-500 hover:text-azul-400 underline transition-colors"
            >
              Términos y condiciones
            </Link>
          </div>

          {/* Columna 2: Redes sociales */}
          <div className="flex flex-col items-center gap-3">
            <h4 className="font-bold text-gray-300 text-sm">Seguínos en</h4>
            <div className="flex gap-3">
              {[
                { icono: <FiTwitter size={20} />, label: "Twitter" },
                { icono: <FiInstagram size={20} />, label: "Instagram" },
                { icono: <FiFacebook size={20} />, label: "Facebook" },
                { icono: <FiYoutube size={20} />, label: "YouTube" },
                { icono: <FiLinkedin size={20} />, label: "LinkedIn" },
              ].map((red) => (
                <a
                  key={red.label}
                  href="#"
                  aria-label={red.label}
                  className="w-10 h-10 flex items-center justify-center rounded-full 
                             bg-oscuro-800 text-white hover:bg-gradient-to-r hover:from-azul-600 hover:to-oro-500 transition-colors duration-200"
                >
                  {red.icono}
                </a>
              ))}
            </div>
            <div className="flex gap-3 mt-1">
              {[
                { icono: <SiTiktok size={20} />, label: "TikTok" },
                { icono: <SiTwitch size={20} />, label: "Twitch" },
              ].map((red) => (
                <a
                  key={red.label}
                  href="#"
                  aria-label={red.label}
                  className="w-10 h-10 flex items-center justify-center rounded-full 
                             bg-oscuro-800 text-white hover:bg-gradient-to-r hover:from-azul-600 hover:to-oro-500 transition-colors duration-200"
                >
                  {red.icono}
                </a>
              ))}
            </div>
          </div>

          {/* Columna 3: Trabajo */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <Link
              href="/trabaja-con-nosotros"
              className="bg-gradient-to-r from-azul-400 to-oro-400 bg-clip-text text-transparent hover:from-azul-300 hover:to-oro-300 font-bold text-sm transition-colors"
            >
              ¡Trabajá con nosotros!
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-cyber-purple-500/30 bg-oscuro-900/70 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-cyber-cyan-300">
            Medios de pago
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {logosPagos.map((logo) => (
              <div
                key={logo.nombre}
                className="relative h-8 w-14 overflow-hidden rounded-md border border-cyber-purple-500/25 bg-white/90"
              >
                <Image
                  src={logo.src}
                  alt={`Logo ${logo.nombre}`}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="bg-oscuro-950 text-center py-4 px-4">
        <p className="text-xs text-gray-400">
          Las marcas y logos de aurapro.com son propiedad de Aura PRO. Todos los derechos reservados.
          Proyecto ficticio para portfolio profesional.
        </p>
      </div>
    </footer>
  );
}
