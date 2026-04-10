"use client";

import Image from "next/image";
import Link from "next/link";
import { FiMinus, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";
import { formatearPrecio } from "@/utils/formato";
import { toast } from "sonner";

interface CartDrawerProps {
  abierto: boolean;
  onCerrar: () => void;
}

export default function CartDrawer({ abierto, onCerrar }: CartDrawerProps) {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCartStore();

  return (
    <>
      <div
        className={`fixed inset-0 z-[75] bg-black/60 transition-opacity ${
          abierto ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCerrar}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 z-[80] flex h-screen w-full md:max-w-md flex-col border-l border-cyber-purple-500/35 bg-oscuro-900 shadow-[-10px_0_30px_rgba(0,0,0,0.45)] transition-transform ${
          abierto ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Carrito de compras"
      >
        <header className="flex items-center justify-between border-b border-cyber-purple-500/30 px-4 py-4">
          <h3 className="text-lg font-bold text-white">Tu carrito</h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar carrito"
            className="rounded-md p-1.5 text-cyber-cyan-200 hover:bg-oscuro-800"
          >
            <FiX size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <p className="rounded-xl border border-cyber-purple-500/30 bg-oscuro-800/75 p-4 text-sm text-cyber-cyan-200/80">
              Tu carrito está vacío.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.producto.id}
                  className="rounded-xl border border-cyber-purple-500/25 bg-oscuro-800/70 p-3"
                >
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-oscuro-950">
                      <Image
                        src={item.producto.imagen}
                        alt={item.producto.nombre}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-white">
                        {item.producto.nombre}
                      </p>
                      <p className="mt-1 text-sm font-bold text-cyber-cyan-300">
                        {formatearPrecio(item.producto.precio)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-md border border-cyber-purple-500/30 bg-oscuro-900 px-1 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.producto.id, Math.max(1, item.cantidad - 1))
                        }
                        className="rounded-md p-1 text-cyber-cyan-200 hover:bg-oscuro-800"
                        aria-label="Disminuir cantidad"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold text-white">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                        className="rounded-md p-1 text-cyber-cyan-200 hover:bg-oscuro-800"
                        aria-label="Aumentar cantidad"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.producto.id);
                        toast.error(`❌ ${item.producto.nombre} eliminado del carrito`);
                      }}
                      className="rounded-md p-2 text-cyber-pink-400 hover:bg-cyber-pink-500/10"
                      aria-label="Eliminar producto"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-cyber-purple-500/30 px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-cyber-cyan-200">Subtotal</span>
            <strong className="text-xl text-cyber-cyan-300">{formatearPrecio(subtotal)}</strong>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={clearCart}
              className="rounded-md border border-cyber-purple-500/35 px-3 py-2 text-sm font-semibold text-cyber-cyan-200 hover:bg-oscuro-800"
            >
              Vaciar
            </button>
            <Link
              href="/checkout"
              onClick={onCerrar}
              className="flex-1 rounded-md bg-cyber-cyan-500 px-3 py-2 text-center text-sm font-bold text-oscuro-950 hover:bg-cyber-cyan-400"
            >
              Finalizar compra
            </Link>
          </div>
        </footer>
      </aside>
    </>
  );
}
