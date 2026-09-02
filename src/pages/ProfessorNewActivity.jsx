import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { toast } from "sonner";
import { BLOQUES, CATEGORIAS } from "@/lib/blocks";
import { ArrowLeft, Check } from "lucide-react";

const DIFICULTADES = ["basica", "intermedia", "avanzada"];

export default function ProfessorNewActivity() {
  const { db, user, crearActividad } = useApp();
  const navigate = useNavigate();
  const misCursos = db.cursos.filter((c) => c.profesorId === user.id);
  const [form, setForm] = useState({
    cursoId: misCursos[0]?.id || "",
    titulo: "",
    enunciado: "",
    dificultad: "basica",
    bloquesPermitidos: ["inicio", "fin", "salida"],
    fechaLimite: "",
  });

  const toggleBloque = (tipo) => {
    setForm((f) => ({
      ...f,
      bloquesPermitidos: f.bloquesPermitidos.includes(tipo)
        ? f.bloquesPermitidos.filter((t) => t !== tipo)
        : [...f.bloquesPermitidos, tipo],
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.cursoId) return toast.error("Selecciona un curso");
    if (!form.titulo.trim()) return toast.error("Escribe un título");
    if (!form.enunciado.trim()) return toast.error("Escribe el enunciado");
    if (form.bloquesPermitidos.length === 0) return toast.error("Selecciona al menos un bloque permitido");
    const a = crearActividad(form);
    toast.success("Actividad creada");
    navigate(`/profesor/actividades/${a.id}`);
  };

  if (misCursos.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Crear actividad</h1>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-500">
          Necesitas crear un curso antes de poder agregar actividades.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Crear actividad</h1>
      <form onSubmit={submit} className="max-w-2xl space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Curso</label>
          <select value={form.cursoId} onChange={(e) => setForm({ ...form, cursoId: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none">
            {misCursos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Título</label>
          <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Enunciado</label>
          <textarea value={form.enunciado} onChange={(e) => setForm({ ...form, enunciado: e.target.value })} rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Dificultad</label>
            <select value={form.dificultad} onChange={(e) => setForm({ ...form, dificultad: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm capitalize focus:border-indigo-400 focus:outline-none">
              {DIFICULTADES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Fecha límite (opcional)</label>
            <input type="date" value={form.fechaLimite} onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-slate-600">Bloques permitidos (limita la paleta del estudiante)</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.values(BLOQUES).map((b) => {
              const cat = CATEGORIAS[b.categoria];
              const sel = form.bloquesPermitidos.includes(b.tipo);
              return (
                <button type="button" key={b.tipo} onClick={() => toggleBloque(b.tipo)}
                  className={`flex items-center gap-2 rounded-lg border-2 px-2.5 py-2 text-left text-xs transition ${sel ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: cat.hex }} />
                  <span className="font-medium text-slate-700">{b.nombre}</span>
                  {sel && <Check size={13} className="ml-auto text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </div>
        <button type="submit" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          <Check size={16} /> Crear actividad
        </button>
      </form>
    </div>
  );
}