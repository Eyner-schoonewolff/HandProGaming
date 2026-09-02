import React, { useState } from "react";
import { Hand, Camera, Play, CheckCircle2, Circle, RotateCcw } from "lucide-react";
import BlockEditor from "@/components/BlockEditor";
import { programaVacio, agregarBloque, actualizarParametro } from "@/lib/program";

// Construye un programa básico de ejemplo: Inicio → Mostrar "¡Hola con gestos!" → Fin
function programaEjemplo() {
  let prog = programaVacio();
  prog = agregarBloque(prog, "inicio");
  prog = agregarBloque(prog, "salida");
  prog = agregarBloque(prog, "fin");
  const sal = prog.bloques.find((b) => b.tipo === "salida");
  if (sal) prog = actualizarParametro(prog, sal.id, "valor", "¡Hola con gestos!");
  return prog;
}

const PASOS = [
  { id: "cam", emoji: "📷", texto: "Activa la cámara con el interruptor del panel derecho." },
  { id: "arriba", emoji: "✋", texto: "Mano abierta: mueve el cursor hacia ARRIBA entre los bloques (mantén el gesto)." },
  { id: "abajo", emoji: "☝️", texto: "Índice arriba: mueve el cursor hacia ABAJO." },
  { id: "sel", emoji: "🤏", texto: "Pinza: selecciona el bloque que está bajo el cursor (se pone con anillo índigo)." },
  { id: "del", emoji: "✌️", texto: "Dos dedos: elimina el bloque seleccionado. Luego agrégalo otra vez desde la paleta con un clic." },
  { id: "run", emoji: "👍", texto: "Pulgar arriba: ejecuta el programa y observa la salida en la consola." },
  { id: "can", emoji: "✊", texto: "Puño cerrado: cancela la selección." },
];

export default function TutorialDemo() {
  const [programa, setPrograma] = useState(programaEjemplo);
  const [hechos, setHechos] = useState({});

  const toggle = (id) => setHechos((h) => ({ ...h, [id]: !h[id] }));
  const reiniciar = () => { setPrograma(programaEjemplo()); setHechos({}); };

  const completados = Object.values(hechos).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-indigo-700">
          <Hand size={16} /> Practica con un ejemplo real
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Este es un programa básico ya armado (Inicio → Mostrar → Fin). Activa la cámara y sigue los pasos de abajo
          para ver cómo cada gesto controla el editor. También puedes usar el teclado si prefieres.
        </p>
      </div>

      {/* Guía de pasos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Camera size={15} className="text-teal-600" /> Pasos guiados
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500">{completados}/{PASOS.length}</span>
            <button onClick={reiniciar} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100">
              <RotateCcw size={12} /> Reiniciar ejemplo
            </button>
          </div>
        </div>
        <ul className="space-y-1.5">
          {PASOS.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => toggle(p.id)}
                className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-slate-50"
              >
                {hechos[p.id]
                  ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  : <Circle size={18} className="mt-0.5 shrink-0 text-slate-300" />}
                <span className="text-base leading-none">{p.emoji}</span>
                <span className={`text-sm ${hechos[p.id] ? "text-slate-400 line-through" : "text-slate-700"}`}>{p.texto}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Editor en vivo */}
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <BlockEditor
          programa={programa}
          setPrograma={setPrograma}
          titulo="Ejemplo: ¡Hola con gestos!"
        />
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
        <Play size={13} className="text-indigo-500" />
        Consejo: si la cámara no está disponible, todos los gestos tienen su equivalente en el teclado (flechas, Enter, Supr, Ctrl+Enter, Esc).
      </div>
    </div>
  );
}