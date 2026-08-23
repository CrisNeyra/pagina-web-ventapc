export const metadata = {
  title: "Política de privacidad | Aura Pro",
  description: "Política de privacidad y tratamiento de datos personales de Aura Pro.",
};

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black text-white">Política de privacidad</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-cyber-cyan-200/85">
          <p>
            Aura Pro respeta la Ley 25.326 de Protección de Datos Personales de Argentina.
            Los datos que nos proporcionás (nombre, email, teléfono, dirección de envío y CV en
            postulaciones) se utilizan exclusivamente para procesar pedidos, brindar soporte y
            gestionar procesos de selección de personal.
          </p>
          <p>
            Los CVs enviados a través de &quot;Trabajá con nosotros&quot; se conservan por un
            máximo de 90 días y luego se eliminan de nuestros sistemas.
          </p>
          <p>
            Utilizamos cookies técnicas para mantener tu sesión y el carrito de compras. No
            vendemos ni compartimos tus datos con terceros, salvo proveedores necesarios para el
            servicio (pagos con Stripe, hosting y correo transaccional).
          </p>
          <p>
            Podés solicitar acceso, rectificación o eliminación de tus datos escribiendo a
            privacidad@aurapro.com.
          </p>
        </div>
      </section>
    </main>
  );
}
