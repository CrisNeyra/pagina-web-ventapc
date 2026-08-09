"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/context/AuthContext";
import { obtenerAuthFirebase } from "@/configuracion/firebase";
import {
  obtenerStripePublishableKey,
  pagosConfigurados,
} from "@/configuracion/stripe";
import { useCartStore } from "@/store/cartStore";
import { crearPaymentIntent } from "@/servicios/pagosServicio";
import { crearPedidoOffline } from "@/servicios/crearPedidoServicio";
import {
  calcularCuota,
  calcularDescuentoTransferencia,
  calcularTotalCheckout,
  CUOTAS_MAXIMAS,
} from "@/lib/checkout";
import { formatearPrecio } from "@/utils/formato";
import type { MetodoPago } from "@/tipos/metodoPago";
import CheckoutMetodosPago from "@/componentes/CheckoutMetodosPago";
import CheckoutPaymentForm from "@/componentes/CheckoutPaymentForm";

const DATOS_TRANSFERENCIA = {
  banco: "Banco Galicia",
  titular: "Aura Pro S.A.",
  cbu: "0070 1234 0000 5678 9012 3456",
  alias: "AURA.PRO.HARDWARE",
};

export default function CheckoutView() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, clearCart } = useCartStore();
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
  const [cuotas, setCuotas] = useState(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [cargandoPago, setCargandoPago] = useState(false);
  const [confirmandoPedido, setConfirmandoPedido] = useState(false);
  const [errorPago, setErrorPago] = useState("");

  const stripePromise = useMemo(() => {
    const key = obtenerStripePublishableKey();
    return key ? loadStripe(key) : null;
  }, []);

  const itemsPago = useMemo(
    () =>
      items.map((item) => ({
        id: item.producto.id,
        precio: item.producto.precio,
        cantidad: item.cantidad,
        nombre: item.producto.nombre,
      })),
    [items]
  );

  const total = useMemo(() => {
    if (!metodoPago) return subtotal;
    return calcularTotalCheckout(itemsPago, metodoPago);
  }, [itemsPago, metodoPago, subtotal]);

  const descuentoTransferencia = useMemo(
    () => (metodoPago === "transferencia" ? calcularDescuentoTransferencia(subtotal) : 0),
    [metodoPago, subtotal]
  );

  const requiereStripe = metodoPago === "debito" || metodoPago === "credito";
  const stripeDisponible = pagosConfigurados();

  useEffect(() => {
    setClientSecret(null);
    setOrderId(null);
    setErrorPago("");

    if (!metodoPago || !requiereStripe || !stripeDisponible) return;
    if (authLoading || !user || itemsPago.length === 0) return;

    let cancelado = false;

    async function iniciarPago() {
      setCargandoPago(true);
      setErrorPago("");

      const auth = obtenerAuthFirebase();
      if (!auth?.currentUser) {
        setErrorPago("No se pudo obtener la sesión del usuario.");
        setCargandoPago(false);
        return;
      }

      const idToken = await auth.currentUser.getIdToken();
      const resultado = await crearPaymentIntent(itemsPago, idToken, {
        metodoPago: metodoPago === "credito" ? "credito" : "debito",
        cuotas: metodoPago === "credito" ? cuotas : 1,
      });

      if (cancelado) return;

      if (!resultado.ok) {
        setErrorPago(resultado.mensaje);
        setCargandoPago(false);
        return;
      }

      setClientSecret(resultado.clientSecret);
      setOrderId(resultado.orderId);
      setCargandoPago(false);
    }

    iniciarPago();

    return () => {
      cancelado = true;
    };
  }, [authLoading, user, itemsPago, metodoPago, cuotas, requiereStripe, stripeDisponible]);

  const confirmarPedidoOffline = async () => {
    if (!metodoPago || (metodoPago !== "efectivo" && metodoPago !== "transferencia")) return;

    setConfirmandoPedido(true);
    setErrorPago("");

    const auth = obtenerAuthFirebase();
    if (!auth?.currentUser) {
      setErrorPago("No se pudo obtener la sesión del usuario.");
      setConfirmandoPedido(false);
      return;
    }

    const idToken = await auth.currentUser.getIdToken();
    const resultado = await crearPedidoOffline(itemsPago, metodoPago, idToken);

    if (!resultado.ok) {
      setErrorPago(resultado.mensaje);
      setConfirmandoPedido(false);
      return;
    }

    clearCart();
    router.push(
      `/checkout/exito?orderId=${resultado.orderId}&metodo=${resultado.metodoPago}`
    );
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-oscuro-950">
        <section className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="mb-4 text-2xl font-black text-white sm:text-3xl">Checkout</h1>
          <p className="rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4 text-sm text-cyber-cyan-200/80">
            Tu carrito está vacío. Agregá productos antes de finalizar la compra.
          </p>
          <Link
            href="/productos"
            className="mt-4 inline-block rounded-md border border-cyber-cyan-400/55 bg-cyber-cyan-500/10 px-4 py-2 text-sm font-bold text-cyber-cyan-300 hover:bg-cyber-cyan-400 hover:text-oscuro-950"
          >
            Ver productos
          </Link>
        </section>
      </main>
    );
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-oscuro-950">
        <section className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-sm text-cyber-cyan-200/80">Cargando checkout...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-oscuro-950">
        <section className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="mb-4 text-2xl font-black text-white sm:text-3xl">Checkout</h1>
          <p className="rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4 text-sm text-cyber-cyan-200/80">
            Iniciá sesión para completar tu compra de forma segura.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-md border border-cyber-cyan-400/55 bg-cyber-cyan-500/10 px-4 py-2 text-sm font-bold text-cyber-cyan-300 hover:bg-cyber-cyan-400 hover:text-oscuro-950"
          >
            Volver al inicio e iniciar sesión
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-oscuro-950">
      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="mb-2 text-2xl font-black text-white sm:text-3xl">Checkout</h1>
          <p className="mb-6 text-sm text-cyber-cyan-200/75">
            Elegí cómo querés pagar tu pedido.
          </p>

          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-cyber-cyan-300">
            Forma de pago
          </h2>
          <CheckoutMetodosPago seleccionado={metodoPago} onSeleccionar={setMetodoPago} />

          {metodoPago === "efectivo" && (
            <div className="mt-6 space-y-4 rounded-xl border border-cyber-purple-500/30 bg-oscuro-800/70 p-4">
              <p className="text-sm text-cyber-cyan-200/85">
                Tu pedido quedará reservado por 48 horas. Podés abonar en efectivo al retirar en
                nuestro local de Lunes a Sábado de 10 a 19 hs.
              </p>
              <p className="text-xs text-cyber-cyan-200/65">
                Dirección: Av. Corrientes 1234, CABA
              </p>
              <button
                type="button"
                onClick={() => void confirmarPedidoOffline()}
                disabled={confirmandoPedido}
                className="rounded-md bg-cyber-cyan-500 px-4 py-3 text-sm font-bold text-oscuro-950 hover:bg-cyber-cyan-400 disabled:opacity-60"
              >
                {confirmandoPedido ? "Confirmando..." : "Confirmar pedido en efectivo"}
              </button>
            </div>
          )}

          {metodoPago === "transferencia" && (
            <div className="mt-6 space-y-4 rounded-xl border border-cyber-purple-500/30 bg-oscuro-800/70 p-4">
              <p className="text-sm font-bold text-cyber-lime-400">
                ¡10% de descuento aplicado! Ahorrás {formatearPrecio(descuentoTransferencia)}
              </p>
              <div className="space-y-1 text-sm text-cyber-cyan-200/85">
                <p>
                  <span className="text-cyber-cyan-300">Banco:</span> {DATOS_TRANSFERENCIA.banco}
                </p>
                <p>
                  <span className="text-cyber-cyan-300">Titular:</span>{" "}
                  {DATOS_TRANSFERENCIA.titular}
                </p>
                <p>
                  <span className="text-cyber-cyan-300">CBU:</span> {DATOS_TRANSFERENCIA.cbu}
                </p>
                <p>
                  <span className="text-cyber-cyan-300">Alias:</span> {DATOS_TRANSFERENCIA.alias}
                </p>
              </div>
              <p className="text-xs text-cyber-cyan-200/65">
                Enviá el comprobante a pagos@aurapro.com indicando tu número de pedido.
              </p>
              <button
                type="button"
                onClick={() => void confirmarPedidoOffline()}
                disabled={confirmandoPedido}
                className="rounded-md bg-cyber-cyan-500 px-4 py-3 text-sm font-bold text-oscuro-950 hover:bg-cyber-cyan-400 disabled:opacity-60"
              >
                {confirmandoPedido ? "Confirmando..." : "Confirmar pedido por transferencia"}
              </button>
            </div>
          )}

          {metodoPago === "credito" && (
            <div className="mt-6 rounded-xl border border-cyber-purple-500/30 bg-oscuro-800/70 p-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-cyber-cyan-200">
                  Cantidad de cuotas (sin interés)
                </span>
                <select
                  value={cuotas}
                  onChange={(evento) => setCuotas(Number(evento.target.value))}
                  className="w-full rounded-md border border-cyber-purple-500/35 bg-oscuro-900 px-3 py-2 text-sm text-white"
                >
                  {Array.from({ length: CUOTAS_MAXIMAS }, (_, indice) => indice + 1).map(
                    (cantidad) => (
                      <option key={cantidad} value={cantidad}>
                        {cantidad} cuota{cantidad > 1 ? "s" : ""} de{" "}
                        {formatearPrecio(calcularCuota(total, cantidad))}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>
          )}

          {requiereStripe && !stripeDisponible && (
            <p className="mt-6 rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4 text-sm text-cyber-cyan-200/80">
              Los pagos con tarjeta requieren configurar Stripe. Mientras tanto, podés elegir
              efectivo o transferencia.
            </p>
          )}

          {requiereStripe && stripeDisponible && cargandoPago && (
            <p className="mt-6 rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4 text-sm text-cyber-cyan-200/80">
              Preparando formulario de pago...
            </p>
          )}

          {errorPago && (
            <p className="mt-6 rounded-xl border border-cyber-pink-500/40 bg-cyber-pink-500/10 p-4 text-sm text-cyber-pink-300">
              {errorPago}
            </p>
          )}

          {requiereStripe &&
            stripeDisponible &&
            !cargandoPago &&
            clientSecret &&
            orderId &&
            stripePromise && (
              <div className="mt-6">
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: "#22d3ee",
                        colorBackground: "#0f172a",
                        colorText: "#e0f2fe",
                      },
                    },
                  }}
                >
                  <CheckoutPaymentForm
                    orderId={orderId}
                    etiquetaBoton={
                      metodoPago === "credito"
                        ? `Pagar en ${cuotas} cuota${cuotas > 1 ? "s" : ""}`
                        : "Pagar con débito"
                    }
                  />
                </Elements>
              </div>
            )}
        </div>

        <aside className="h-fit rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-5">
          <h2 className="text-lg font-bold text-white">Resumen del pedido</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li
                key={item.producto.id}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="line-clamp-2 font-semibold text-cyber-cyan-100">
                    {item.producto.nombre}
                  </p>
                  <p className="text-cyber-cyan-200/70">Cantidad: {item.cantidad}</p>
                </div>
                <span className="shrink-0 font-bold text-cyber-cyan-300">
                  {formatearPrecio(item.producto.precio * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>

          {descuentoTransferencia > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-cyber-lime-400">
              <span>Descuento transferencia (10%)</span>
              <span>-{formatearPrecio(descuentoTransferencia)}</span>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-cyber-purple-500/30 pt-4">
            <span className="text-sm text-cyber-cyan-200">Total</span>
            <strong className="text-xl text-cyber-cyan-300">{formatearPrecio(total)}</strong>
          </div>

          {metodoPago === "credito" && cuotas > 1 && (
            <p className="mt-2 text-xs text-cyber-cyan-200/70">
              {cuotas} cuotas de {formatearPrecio(calcularCuota(total, cuotas))} sin interés
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}
