"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { formatearPrecio } from "@/utils/formato";
import CheckoutPaymentForm from "@/componentes/CheckoutPaymentForm";

export default function CheckoutView() {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal } = useCartStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [cargandoPago, setCargandoPago] = useState(false);
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
      })),
    [items]
  );

  useEffect(() => {
    if (authLoading || !user || itemsPago.length === 0 || !pagosConfigurados()) {
      return;
    }

    let cancelado = false;

    async function iniciarPago() {
      setCargandoPago(true);
      setErrorPago("");
      setClientSecret(null);
      setOrderId(null);

      const auth = obtenerAuthFirebase();
      if (!auth?.currentUser) {
        setErrorPago("No se pudo obtener la sesión del usuario.");
        setCargandoPago(false);
        return;
      }

      const idToken = await auth.currentUser.getIdToken();
      const resultado = await crearPaymentIntent(itemsPago, idToken);

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
  }, [authLoading, user, itemsPago]);

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

  if (!pagosConfigurados()) {
    return (
      <main className="min-h-screen bg-oscuro-950">
        <section className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="mb-4 text-2xl font-black text-white sm:text-3xl">Checkout</h1>
          <p className="rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4 text-sm text-cyber-cyan-200/80">
            Los pagos no están configurados. Agregá{" "}
            <code className="text-cyber-cyan-300">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> en
            tu <code className="text-cyber-cyan-300">.env.local</code> y desplegá la Cloud
            Function <code className="text-cyber-cyan-300">createStripePaymentIntent</code>.
          </p>
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
            Pagá de forma segura con Stripe. Tu pedido se registrará automáticamente.
          </p>

          {cargandoPago && (
            <p className="rounded-xl border border-cyber-purple-500/35 bg-oscuro-900/85 p-4 text-sm text-cyber-cyan-200/80">
              Preparando formulario de pago...
            </p>
          )}

          {errorPago && (
            <div className="space-y-3">
              <p className="rounded-xl border border-cyber-pink-500/40 bg-cyber-pink-500/10 p-4 text-sm text-cyber-pink-300">
                {errorPago}
              </p>
              <Link
                href="/checkout/error"
                className="inline-block text-sm font-semibold text-cyber-cyan-300 underline"
              >
                Ver opciones de ayuda
              </Link>
            </div>
          )}

          {!cargandoPago && clientSecret && orderId && stripePromise && (
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
              <CheckoutPaymentForm orderId={orderId} />
            </Elements>
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
          <div className="mt-4 flex items-center justify-between border-t border-cyber-purple-500/30 pt-4">
            <span className="text-sm text-cyber-cyan-200">Total</span>
            <strong className="text-xl text-cyber-cyan-300">{formatearPrecio(subtotal)}</strong>
          </div>
        </aside>
      </section>
    </main>
  );
}
