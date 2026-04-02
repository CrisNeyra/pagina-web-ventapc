const WHATSAPP_NUMBER = "5491111111111";
const WHATSAPP_MESSAGE = "Hola! Quiero informacion sobre sus productos.";

export default function FloatingWhatsApp() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2">
      <span className="rounded-full border border-cyber-cyan-400/40 bg-oscuro-900/90 px-3 py-1 text-xs font-semibold text-cyber-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.25)]">
        ¡Escríbenos por WhatsApp!
      </span>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir chat de WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-[#25D366] text-white shadow-[0_0_20px_rgba(37,211,102,0.55)] transition-transform duration-200 hover:scale-105"
      >
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className="h-8 w-8 fill-current"
        >
          <path d="M19.11 17.23c-.3-.15-1.77-.87-2.05-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.24-.46-2.37-1.46-.88-.78-1.47-1.74-1.64-2.03-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.08 3.18 5.04 4.45.7.3 1.25.47 1.68.6.7.22 1.33.19 1.83.12.56-.08 1.77-.72 2.03-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
          <path d="M16.01 3.2c-7.06 0-12.79 5.73-12.79 12.79 0 2.25.59 4.45 1.7 6.38L3.12 28.8l6.6-1.74a12.72 12.72 0 0 0 6.29 1.61h.01c7.06 0 12.79-5.73 12.79-12.79 0-3.42-1.33-6.64-3.76-9.06a12.7 12.7 0 0 0-9.04-3.62zm0 23.31h-.01a10.57 10.57 0 0 1-5.39-1.48l-.39-.23-3.92 1.03 1.05-3.83-.25-.4a10.59 10.59 0 0 1-1.62-5.61c0-5.84 4.75-10.59 10.59-10.59 2.82 0 5.47 1.09 7.46 3.08a10.48 10.48 0 0 1 3.11 7.52c0 5.84-4.75 10.59-10.62 10.59z" />
        </svg>
      </a>
    </div>
  );
}
