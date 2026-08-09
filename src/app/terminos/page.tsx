import Link from "next/link";

export const metadata = {
  title: "Términos y condiciones | Aura Pro",
  description: "Términos y condiciones de uso de la tienda Aura Pro.",
};

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black text-white">Términos y condiciones</h1>
        <p className="mt-3 text-sm text-cyber-cyan-200/80">
          Última actualización: agosto 2026. Al utilizar aurapro.com aceptás estos términos.
        </p>

        <div className="mt-8 space-y-6 rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-6 text-sm text-cyber-cyan-200/85">
          <section>
            <h2 className="text-lg font-bold text-white">1. Identificación del vendedor</h2>
            <p className="mt-2">
              Aura Pro S.A. — CUIT 30-00000000-0 — Av. Corrientes 1234, CABA, Argentina.
              Contacto: <strong className="text-cyber-cyan-300">info@aurapro.com</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">2. Objeto</h2>
            <p className="mt-2">
              Estos términos regulan la compraventa de productos de hardware y periféricos
              ofrecidos a través del sitio web. El proyecto es ficticio con fines de portfolio
              profesional; los precios y stock son referenciales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">3. Precios y pagos</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Los precios están expresados en pesos argentinos (ARS) e incluyen IVA cuando corresponda.</li>
              <li>Medios de pago: efectivo en local, transferencia bancaria (10% de descuento), tarjeta de débito y crédito.</li>
              <li>Crédito: hasta 12 cuotas sin interés según promociones vigentes.</li>
              <li>La confirmación del pedido queda sujeta a verificación de stock y pago.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">4. Envíos y entregas</h2>
            <p className="mt-2">
              Los plazos de entrega son estimativos. Aura Pro no se responsabiliza por demoras
              atribuibles a empresas de transporte o causas de fuerza mayor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">5. Garantía</h2>
            <p className="mt-2">
              Todos los productos cuentan con garantía oficial del fabricante de hasta 36 meses,
              según el tipo de producto. La garantía no cubre daños por mal uso, instalación
              incorrecta o modificaciones no autorizadas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">6. Derecho de arrepentimiento</h2>
            <p className="mt-2">
              Podés revocar tu compra dentro de los 10 días corridos según la Ley 24.240.
              Consultá el procedimiento en nuestra página de{" "}
              <Link href="/arrepentimiento" className="text-cyber-cyan-300 underline">
                Botón de arrepentimiento
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">7. Privacidad</h2>
            <p className="mt-2">
              Los datos personales se utilizan únicamente para procesar pedidos, autenticación y
              comunicaciones comerciales. No compartimos información con terceros salvo obligación
              legal o proveedores necesarios (pagos, envíos).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">8. Jurisdicción</h2>
            <p className="mt-2">
              Para cualquier controversia, las partes se someten a los tribunales ordinarios de
              la Ciudad Autónoma de Buenos Aires, conforme a la legislación argentina.
            </p>
          </section>
        </div>

        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-cyber-cyan-300 underline hover:text-cyber-cyan-200"
        >
          ← Volver al inicio
        </Link>
      </section>
    </main>
  );
}
