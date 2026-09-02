import React, { useState } from "react";
import { Keyboard, Camera, Hand, Sliders, Check } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { toast } from "sonner";

export default function Settings() {
  const { user, updateUser } = useApp();
  const [modo, setModo] = useState("teclado");
  const [sensibilidad, setSensibilidad] = useState(50);
  const [nombre, setNombre] = useState(user?.nombre || "");

  const guardar = () => {
    updateUser(user.id, { nombre });
    toast.success("Configuración guardada");
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500">Personaliza tu experiencia en HandProGaming</p>
      </div>

      {/* Perfil */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
          <Hand size={16} className="text-indigo-600" /> Perfil
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Correo</label>
            <input value={user?.correo || ""} disabled
              className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-400" />
          </div>
        </div>
      </div>

      {/* Modo de control */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
          <Sliders size={16} className="text-indigo-600" /> Modo de control
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { id: "teclado", icon: Keyboard, title: "Teclado", desc: "Controla todo con el teclado" },
            { id: "gestos", icon: Camera, title: "Gestos", desc: "Usa la cámara y tu mano" },
            { id: "auto", icon: Hand, title: "Automático", desc: "Gestos si hay cámara, si no teclado" },
          ].map((m) => {
            const sel = modo === m.id;
            return (
              <button key={m.id} onClick={() => setModo(m.id)}
                className={`rounded-xl border-2 p-4 text-left transition ${sel ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                <m.icon size={20} className={sel ? "text-indigo-600" : "text-slate-400"} />
                <p className="mt-2 text-sm font-bold text-slate-800">{m.title}</p>
                <p className="text-[11px] text-slate-500">{m.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <label className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Sensibilidad de gestos</span>
            <span className="text-slate-400">{sensibilidad}%</span>
          </label>
          <input type="range" min="0" max="100" value={sensibilidad} onChange={(e) => setSensibilidad(e.target.value)}
            className="w-full accent-indigo-600" />
        </div>
      </div>

      <button onClick={guardar} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
        <Check size={16} /> Guardar cambios
      </button>
    </div>
  );
}