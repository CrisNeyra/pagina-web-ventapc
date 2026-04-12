"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Opinion {
  nombre: string;
  estrellas: number;
  texto: string;
}

const opinionesIniciales: Opinion[] = [
  { nombre: "Lucía Gómez", estrellas: 5, texto: "La atención fue excelente y el envío llegó antes de lo esperado." },
  { nombre: "Mariano Díaz", estrellas: 5, texto: "Compré una GPU y funcionó perfecto desde el primer día." },
  { nombre: "Carla Pereira", estrellas: 4, texto: "Muy buenos precios y respuesta rápida por WhatsApp." },
  { nombre: "Santiago Ruiz", estrellas: 5, texto: "El proceso de compra fue claro y súper simple." },
  { nombre: "Valentina Torres", estrellas: 5, texto: "La calidad del producto superó mis expectativas." },
  { nombre: "Joaquín Benítez", estrellas: 5, texto: "Excelente seguimiento del pedido y soporte postventa." },
  { nombre: "Micaela Funes", estrellas: 4, texto: "Me ayudaron con una consulta técnica en minutos." },
  { nombre: "Tomás Acosta", estrellas: 5, texto: "Todo llegó impecable, bien embalado y con factura." },
  { nombre: "Agustina León", estrellas: 5, texto: "La web es clara y el carrito funciona muy bien." },
  { nombre: "Franco Sosa", estrellas: 5, texto: "Volvería a comprar sin dudas, gran experiencia." },
];

export default function ValoracionesUsuarios() {
  const { user } = useAuth();
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [opiniones, setOpiniones] = useState<Opinion[]>(opinionesIniciales);

  const nombreUsuario = user?.email
    ? user.email.split("@")[0]
    : "Usuario Aura Pro";

  const enviarValoracion = () => {
    const texto = comentario.trim();
    setOpiniones((previo) => [
      {
        nombre: nombreUsuario,
        estrellas: calificacion,
        texto: texto || "Sin comentario. Valoración enviada por el usuario.",
      },
      ...previo,
    ]);
    setComentario("");
    setCalificacion(5);
  };

  return (
    <section className="mx-auto my-10 max-w-7xl px-4">
      <article className="rounded-2xl border border-cyber-purple-500/35 bg-oscuro-900/80 p-5">
        <h2 className="text-xl font-black text-white sm:text-2xl">Valoraciones de usuarios</h2>
        <p className="mt-2 text-sm text-cyber-cyan-200/85">
          97% de los usuarios está satisfecho con productos, servicio, calidad y entregas.
        </p>

        <div className="mt-4 rounded-xl border border-cyber-purple-500/25 bg-oscuro-800/70 p-4">
          <p className="text-sm font-semibold text-cyber-cyan-200">Tu valoración</p>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((estrella) => (
              <button
                key={estrella}
                type="button"
                onClick={() => setCalificacion(estrella)}
                className={`text-2xl ${estrella <= calificacion ? "text-yellow-400" : "text-cyber-cyan-300/35"}`}
                aria-label={`Calificar con ${estrella} estrellas`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm font-semibold text-cyber-cyan-200">{calificacion}/5</span>
          </div>

          <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-cyber-cyan-300/80">
            Comentario (opcional)
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Contanos cómo fue tu experiencia..."
            className="mt-2 w-full rounded-md border border-cyber-purple-500/35 bg-oscuro-900 px-3 py-2 text-sm text-cyber-cyan-100 outline-none focus:border-cyber-cyan-400"
            rows={3}
          />
          <button
            type="button"
            onClick={enviarValoracion}
            className="mt-3 rounded-md border border-cyber-cyan-400/55 bg-cyber-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyber-cyan-300 hover:bg-cyber-cyan-400 hover:text-oscuro-950"
          >
            Enviar valoración
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {opiniones.map((opinion, indice) => (
            <article
              key={`${opinion.nombre}-${indice}`}
              className="rounded-lg border border-cyber-purple-500/25 bg-oscuro-800/70 p-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{opinion.nombre}</h3>
                <p className="text-yellow-400">{Array(opinion.estrellas).fill("★").join("")}</p>
              </div>
              <p className="mt-2 text-sm text-cyber-cyan-100/85">{opinion.texto}</p>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}
