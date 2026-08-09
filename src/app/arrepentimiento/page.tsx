import Link from "next/link";

export const metadata = {
  title: "Botón de arrepentimiento | Aura Pro",
  description:
    "Ejercé tu derecho de arrepentimiento conforme a la Ley de Defensa del Consumidor (Argentina).",
};

export default function ArrepentimientoPage() {
  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black text-white">Botón de arrepentimiento</h1>
        <p className="mt-3 text-sm text-cyber-cyan-200/80">
          De acuerdo con la Ley 24.240 de Defensa del Consumidor, tenés derecho a revocar la
          aceptación de tu compra dentro de los <strong className="text-cyber-cyan-300">10 días
          corridos</strong> contados desde la entrega del producto o la celebración del contrato
          (lo que ocurra último), sin necesidad de justificar causa.
        </p>

        <div className="mt-8 space-y-6 rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-6">
          <div>
            <h2 className="text-lg font-bold text-white">¿Cómo ejercer el arrepentimiento?</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-cyber-cyan-200/85">
              <li>Enviá un email a <strong className="text-cyber-cyan-300">arrepentimiento@aurapro.com</strong> con tu número de pedido.</li>
              <li>Indicá el producto o productos que deseás devolver.</li>
              <li>Conservá el producto en su estado original, con empaque y accesorios.</li>
              <li>Te responderemos en un plazo máximo de 48 horas hábiles.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">Condiciones de la devolución</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-cyber-cyan-200/85">
              <li>El producto no debe haber sido usado ni presentar daños.</li>
              <li>Debe incluir factura o comprobante de compra.</li>
              <li>El reintegro se realizará por el mismo medio de pago utilizado, en un plazo de hasta 10 días hábiles desde la recepción del producto.</li>
              <li>Los costos de envío de devolución corren por cuenta del consumidor, salvo que el producto presente fallas.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">Excepciones</h2>
            <p className="mt-3 text-sm text-cyber-cyan-200/85">
              No aplica el derecho de arrepentimiento en productos personalizados, software
              abierto, bienes perecederos o aquellos excluidos por normativa vigente.
            </p>
          </div>

          <div className="rounded-xl border border-cyber-cyan-500/30 bg-cyber-cyan-500/5 p-4">
            <p className="text-sm text-cyber-cyan-200">
              <strong className="text-cyber-cyan-300">Contacto:</strong> arrepentimiento@aurapro.com
              <br />
              <strong className="text-cyber-cyan-300">Teléfono:</strong> +54 11 4000-0000
              <br />
              <strong className="text-cyber-cyan-300">Horario:</strong> Lun a Vie de 9:00 a 18:00
            </p>
          </div>
        </div>

        <Link
          href="/ayuda"
          className="mt-6 inline-block text-sm font-semibold text-cyber-cyan-300 underline hover:text-cyber-cyan-200"
        >
          ← Volver al centro de ayuda
        </Link>
      </section>
    </main>
  );
}
