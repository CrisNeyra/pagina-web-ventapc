"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCartStore } from "@/store/cartStore";

interface CheckoutPaymentFormProps {
  orderId: string;
  etiquetaBoton?: string;
}

export default function CheckoutPaymentForm({
  orderId,
  etiquetaBoton = "Pagar ahora",
}: CheckoutPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const manejarSubmit = async (evento: FormEvent) => {
    evento.preventDefault();
    setError("");

    if (!stripe || !elements) return;

    setProcesando(true);

    const origen = window.location.origin;
    const resultado = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${origen}/checkout/exito?orderId=${orderId}`,
      },
      redirect: "if_required",
    });

    if (resultado.error) {
      setError(resultado.error.message ?? "No se pudo completar el pago.");
      setProcesando(false);
      return;
    }

    if (resultado.paymentIntent?.status === "succeeded") {
      clearCart();
      router.push(`/checkout/exito?orderId=${orderId}`);
      return;
    }

    setProcesando(false);
  };

  return (
    <form onSubmit={manejarSubmit} className="space-y-4">
      <div className="rounded-xl border border-cyber-purple-500/30 bg-oscuro-800/70 p-4">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-cyber-pink-500/40 bg-cyber-pink-500/10 px-3 py-2 text-sm text-cyber-pink-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || procesando}
        className="w-full rounded-md bg-cyber-cyan-500 px-4 py-3 text-sm font-bold text-oscuro-950 transition-colors hover:bg-cyber-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {procesando ? "Procesando pago..." : etiquetaBoton}
      </button>
    </form>
  );
}
