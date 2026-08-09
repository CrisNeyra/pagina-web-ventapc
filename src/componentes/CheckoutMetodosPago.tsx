import type { MetodoPago } from "@/tipos/metodoPago";
import { METODOS_PAGO } from "@/tipos/metodoPago";
import {
  FiCreditCard,
  FiDollarSign,
  FiSmartphone,
  FiTrendingDown,
} from "react-icons/fi";
import type { IconType } from "react-icons";

const ICONOS: Record<MetodoPago, IconType> = {
  efectivo: FiDollarSign,
  transferencia: FiTrendingDown,
  debito: FiSmartphone,
  credito: FiCreditCard,
};

interface CheckoutMetodosPagoProps {
  seleccionado: MetodoPago | null;
  onSeleccionar: (metodo: MetodoPago) => void;
}

export default function CheckoutMetodosPago({
  seleccionado,
  onSeleccionar,
}: CheckoutMetodosPagoProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {METODOS_PAGO.map((metodo) => {
        const Icono = ICONOS[metodo.id];
        const activo = seleccionado === metodo.id;

        return (
          <button
            key={metodo.id}
            type="button"
            onClick={() => onSeleccionar(metodo.id)}
            className={`rounded-xl border p-4 text-left transition-all duration-200 ${
              activo
                ? "border-cyber-cyan-400 bg-cyber-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                : "border-cyber-purple-500/30 bg-oscuro-800/70 hover:border-cyber-cyan-400/50"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icono className="text-cyber-cyan-400" size={18} />
                <h3 className="text-sm font-bold text-white">{metodo.titulo}</h3>
              </div>
              {metodo.badge && (
                <span className="rounded-full bg-cyber-lime-400/20 px-2 py-0.5 text-[10px] font-bold uppercase text-cyber-lime-400">
                  {metodo.badge}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-cyber-cyan-200/75">{metodo.descripcion}</p>
          </button>
        );
      })}
    </div>
  );
}
