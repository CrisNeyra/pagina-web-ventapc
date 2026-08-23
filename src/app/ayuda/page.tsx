import Link from "next/link";

const faqs = [
  {
    pregunta: "¿Cuáles son los métodos de pago?",
    respuesta:
      "Aceptamos efectivo en el local, transferencia bancaria (10% de descuento), tarjeta de débito y crédito en hasta 12 cuotas sin interés.",
  },
  {
    pregunta: "¿Cuánto tarda el envío?",
    respuesta:
      "Los envíos a CABA demoran entre 3 y 5 días hábiles. GBA e interior pueden demorar hasta 7 días hábiles según la zona.",
  },
  {
    pregunta: "¿Puedo retirar en el local?",
    respuesta:
      "Sí. Podés elegir retiro en Av. Corrientes 1234, CABA, de lunes a sábado de 10 a 19 hs.",
  },
  {
    pregunta: "¿Cómo ejerzo el botón de arrepentimiento?",
    respuesta: (
      <>
        Tenés 10 días corridos desde la compra. Completá el formulario en la página de{" "}
        <Link href="/arrepentimiento" className="text-cyber-cyan-300 underline">
          arrepentimiento
        </Link>
        .
      </>
    ),
  },
  {
    pregunta: "¿Los productos tienen garantía?",
    respuesta:
      "Todos los productos cuentan con garantía oficial del fabricante. Consultá los términos en cada ficha de producto.",
  },
];

export default function AyudaPage() {
  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-4 text-3xl font-black text-white">Centro de Ayuda</h1>
        <p className="mb-6 text-sm text-cyber-cyan-200/85">
          Horario de atención: Lun a Vie de 9:00 a 18:00. También podés escribirnos por WhatsApp.
        </p>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.pregunta}
              className="rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4"
            >
              <summary className="cursor-pointer font-semibold text-white">{faq.pregunta}</summary>
              <p className="mt-3 text-sm text-cyber-cyan-200/80">{faq.respuesta}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
