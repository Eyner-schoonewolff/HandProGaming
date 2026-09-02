import React, { useState } from "react";
import { Hand, Keyboard, Camera, HelpCircle, Check, ArrowLeft } from "lucide-react";
import TutorialDemo from "@/components/TutorialDemo";

const GESTOS = [
  { emoji: "✋", nombre: "Mano abierta", accion: "Mover el puntero por el lienzo", tecla: "Flechas", pasos: "Abre la mano con los dedos extendidos frente a la cámara. Mueve la mano para desplazar el cursor circular por el lienzo." },
  { emoji: "🤏", nombre: "Pinza", accion: "Tomar / soltar el bloque", tecla: "Enter", pasos: "Junta la yema del índice y del pulgar. Mantén ~400 ms para tomar el bloque bajo el puntero; repite para soltarlo." },
  { emoji: "✊", nombre: "Puño cerrado", accion: "Cancelar la acción actual", tecla: "Esc", pasos: "Cierra el puño por completo. Aparecerá un halo rojo y se cancelará la acción en curso." },
  { emoji: "☝️", nombre: "Índice arriba", accion: "Desplazar (pan) el lienzo", tecla: "Tab", pasos: "Levanta solo el dedo índice, con el puño cerrado. Mueve la mano para desplazar el lienzo." },
  { emoji: "✌️", nombre: "Dos dedos", accion: "Eliminar el bloque seleccionado", tecla: "Supr", pasos: "Muestra índice y medio levantados. Se abrirá un diálogo de confirmación antes de eliminar." },
  { emoji: "👍", nombre: "Pulgar arriba", accion: "Ejecutar el programa", tecla: "Ctrl+Enter", pasos: "Cierra el puño y levanta solo el pulgar. El botón Ejecutar destellará y el programa correrá." },
];

const ATAJOS = [
  { tecla: "Tab / Shift+Tab", accion: "Cambiar de zona: Paleta → Lienzo → Consola" },
  { tecla: "↑ ↓ ← →", accion: "Mover el foco entre bloques (o mover el bloque tomado)" },
  { tecla: "Enter", accion: "Tomar el bloque enfocado / soltarlo" },
  { tecla: "Esc", accion: "Cancelar la acción en curso" },
  { tecla: "Supr / Backspace", accion: "Eliminar el bloque seleccionado" },
  { tecla: "Ctrl/Cmd + Enter", accion: "Ejecutar el programa" },
  { tecla: "Ctrl/Cmd + S", accion: "Guardar" },
  { tecla: "?", accion: "Abrir esta guía de gestos y atajos" },
];

const PASOS_BLOQUES = [
  "Agrega el bloque Inicio desde la categoría Control (verde).",
  "Añade un bloque Mostrar (Entrada/Salida, azul) y escribe el texto a mostrar.",
  "Conecta los bloques en orden; el sistema los acopla automáticamente.",
  "Termina con el bloque Fin. El botón Ejecutar se habilitará solo cuando el programa esté completo.",
  "Pulsa Ejecutar y observa el flujo paso a paso en la consola.",
];

export default function StudentTutorial() {
  const [sel, setSel] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tutorial de gestos y atajos</h1>
        <p className="text-sm text-slate-500">Aprende a controlar el editor con la mano o el teclado</p>
      </div>

      {/* Gestos */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><Hand size={16} className="text-indigo-600" /> Gestos</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GESTOS.map((g) => (
            <button key={g.nombre} onClick={() => setSel(g)}
              className={`rounded-2xl border-2 p-4 text-left transition ${sel?.nombre === g.nombre ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{g.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">{g.nombre}</p>
                  <p className="text-xs text-slate-500">{g.accion}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Atajo: <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">{g.tecla}</kbd></p>
            </button>
          ))}
        </div>

        {sel && (
          <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-700"><span className="text-2xl">{sel.emoji}</span> {sel.nombre}</h3>
              <button onClick={() => setSel(null)} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={16} /></button>
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500">Acción: {sel.accion}</p>
            <p className="mt-2 text-sm text-slate-700">{sel.pasos}</p>
            <p className="mt-2 text-[11px] text-slate-400">Equivalente en teclado: <kbd className="rounded bg-white px-1.5 py-0.5 font-mono">{sel.tecla}</kbd></p>
          </div>
        )}
      </div>

      {/* Atajos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><Keyboard size={16} className="text-teal-600" /> Atajos de teclado</h2>
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr><th className="px-4 py-2 font-medium">Tecla</th><th className="px-4 py-2 font-medium">Acción</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ATAJOS.map((a, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5"><kbd className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">{a.tecla}</kbd></td>
                  <td className="px-4 py-2.5 text-slate-600">{a.accion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo interactiva con ejemplo básico */}
      <TutorialDemo />

      {/* Primeros pasos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><HelpCircle size={16} className="text-violet-600" /> Primeros pasos con los bloques</h2>
        <ol className="space-y-2">
          {PASOS_BLOQUES.map((p, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{i + 1}</span>
              {p}
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-700">
        <Camera size={16} className="mb-1 inline" /> Sin cámara o permiso denegado, la plataforma sigue siendo 100% usable con el teclado. El vídeo nunca se envía a un servidor.
      </div>
    </div>
  );
}