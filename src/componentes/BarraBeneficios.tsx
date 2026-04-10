import { FiCreditCard, FiTruck, FiShield } from "react-icons/fi";
import Image from "next/image";

const logosTarjetas = [
  { nombre: "Visa", src: "/assets/visa.svg" },
  { nombre: "Mastercard", src: "/assets/mastercard.svg" },
  { nombre: "American Express", src: "/assets/amex.svg" },
  { nombre: "Cabal", src: "/assets/cabal.svg" },
];

// Barra de beneficios — 3 columnas como Compra Gamer
export default function BarraBeneficios() {
  const beneficios = [
    {
      icono: <FiCreditCard size={28} />,
      titulo: "Hasta 6 cuotas sin interés",
      detalle: "con todas las tarjetas",
    },
    {
      icono: <FiTruck size={28} />,
      titulo: "Envíos rápidos",
      detalle: "a todo el país.",
    },
    {
      icono: <FiShield size={28} />,
      titulo: "Garantía oficial",
      detalle: "de hasta 36 meses en todos los productos.",
    },
  ];

  return (
    <section className="border-y border-oscuro-700 bg-oscuro-950">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-0 md:divide-x divide-oscuro-700">
          {beneficios.map((b, indice) => (
            <div
              key={b.titulo}
              className={`flex gap-4 px-6 py-2 ${
                indice === 0 ? "items-start justify-start" : "items-center justify-center"
              }`}
            >
              <span className="text-oro-400 flex-shrink-0">{b.icono}</span>
              <div className="w-full">
                <h3 className="font-bold text-white text-sm">{b.titulo}</h3>
                <p className="text-xs text-azul-400">{b.detalle}</p>

                {indice === 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {logosTarjetas.map((logo) => (
                      <div
                        key={logo.nombre}
                        className="relative h-8 w-14 overflow-hidden rounded-md border border-cyber-purple-500/25 bg-white/95"
                      >
                        <Image
                          src={logo.src}
                          alt={`Tarjeta ${logo.nombre}`}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
