"use client";

import type { DatosEntrega, TipoEntrega } from "@/lib/entrega";
import { COSTO_ENVIO_PESOS } from "@/lib/entrega";
import { formatearPrecio } from "@/utils/formato";
import { FiMapPin, FiPackage } from "react-icons/fi";

interface CheckoutEntregaProps {
  datos: DatosEntrega;
  onChange: (datos: DatosEntrega) => void;
}

export default function CheckoutEntrega({ datos, onChange }: CheckoutEntregaProps) {
  const seleccionarTipo = (tipo: TipoEntrega) => {
    if (tipo === "retiro") {
      onChange({ tipo: "retiro" });
      return;
    }

    onChange({
      tipo: "envio",
      envio: datos.envio ?? {
        direccion: "",
        ciudad: "",
        codigoPostal: "",
        telefonoContacto: "",
      },
    });
  };

  const actualizarEnvio = (campo: keyof NonNullable<DatosEntrega["envio"]>, valor: string) => {
    onChange({
      tipo: "envio",
      envio: {
        direccion: datos.envio?.direccion ?? "",
        ciudad: datos.envio?.ciudad ?? "",
        codigoPostal: datos.envio?.codigoPostal ?? "",
        telefonoContacto: datos.envio?.telefonoContacto ?? "",
        [campo]: valor,
      },
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-cyber-cyan-300">
        Entrega
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => seleccionarTipo("retiro")}
          className={`rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400 ${
            datos.tipo === "retiro"
              ? "border-cyber-cyan-400 bg-cyber-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              : "border-cyber-purple-500/30 bg-oscuro-800/70 hover:border-cyber-cyan-400/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <FiPackage className="text-cyber-cyan-400" size={18} />
            <h3 className="text-sm font-bold text-white">Retiro en el local</h3>
          </div>
          <p className="mt-2 text-xs text-cyber-cyan-200/75">
            Av. Corrientes 1234, CABA. Sin costo adicional.
          </p>
        </button>

        <button
          type="button"
          onClick={() => seleccionarTipo("envio")}
          className={`rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400 ${
            datos.tipo === "envio"
              ? "border-cyber-cyan-400 bg-cyber-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              : "border-cyber-purple-500/30 bg-oscuro-800/70 hover:border-cyber-cyan-400/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <FiMapPin className="text-cyber-cyan-400" size={18} />
            <h3 className="text-sm font-bold text-white">Envío a domicilio</h3>
          </div>
          <p className="mt-2 text-xs text-cyber-cyan-200/75">
            Entrega en 3 a 7 días hábiles. Costo: {formatearPrecio(COSTO_ENVIO_PESOS)}.
          </p>
        </button>
      </div>

      {datos.tipo === "envio" && (
        <div className="grid gap-3 rounded-xl border border-cyber-purple-500/30 bg-oscuro-800/70 p-4 sm:grid-cols-2">
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs font-semibold text-cyber-cyan-200">Dirección</span>
            <input
              type="text"
              value={datos.envio?.direccion ?? ""}
              onChange={(evento) => actualizarEnvio("direccion", evento.target.value)}
              className="w-full rounded-md border border-cyber-purple-500/35 bg-oscuro-900 px-3 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400"
              placeholder="Calle y número, piso/depto"
              autoComplete="street-address"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-cyber-cyan-200">Ciudad</span>
            <input
              type="text"
              value={datos.envio?.ciudad ?? ""}
              onChange={(evento) => actualizarEnvio("ciudad", evento.target.value)}
              className="w-full rounded-md border border-cyber-purple-500/35 bg-oscuro-900 px-3 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400"
              placeholder="Buenos Aires"
              autoComplete="address-level2"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-cyber-cyan-200">Código postal</span>
            <input
              type="text"
              value={datos.envio?.codigoPostal ?? ""}
              onChange={(evento) => actualizarEnvio("codigoPostal", evento.target.value)}
              className="w-full rounded-md border border-cyber-purple-500/35 bg-oscuro-900 px-3 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400"
              placeholder="C1043"
              autoComplete="postal-code"
            />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs font-semibold text-cyber-cyan-200">Teléfono de contacto</span>
            <input
              type="tel"
              value={datos.envio?.telefonoContacto ?? ""}
              onChange={(evento) => actualizarEnvio("telefonoContacto", evento.target.value)}
              className="w-full rounded-md border border-cyber-purple-500/35 bg-oscuro-900 px-3 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan-400"
              placeholder="+54 11 5555-5555"
              autoComplete="tel"
            />
          </label>
        </div>
      )}
    </div>
  );
}
