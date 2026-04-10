const WHATSAPP_NUMBER = "5491168883430";
const WHATSAPP_MESSAGE =
  "Hola, me comunico desde Aura Pro para recibir asesoramiento.";

export default function FloatingWhatsApp() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-[100]">
      <span className="absolute bottom-1/2 right-16 hidden max-w-[240px] translate-y-1/2 rounded-full border border-cyber-cyan-400/40 bg-oscuro-900/95 px-3 py-1 text-xs font-semibold text-cyber-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.25)] sm:block">
        Hola, somos el equipo de Aura Pro. ¿En qué podemos ayudarte?
      </span>

      <span className="absolute bottom-16 right-0 max-w-[220px] rounded-full border border-cyber-cyan-400/40 bg-oscuro-900/95 px-3 py-1 text-xs font-semibold text-cyber-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.25)] sm:hidden">
        Hola, somos el equipo de Aura Pro. ¿En qué podemos ayudarte?
      </span>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir chat de WhatsApp"
        className="inline-flex h-14 w-14 items-center justify-center transition-transform duration-200 hover:scale-105"
      >
        <img
          src="/whatsapp.svg"
          alt="WhatsApp"
          className="h-14 w-14 rounded-full border border-white/20 bg-[#25D366] object-cover object-center shadow-[0_0_20px_rgba(37,211,102,0.55)]"
        />
      </a>
    </div>
  );
}
