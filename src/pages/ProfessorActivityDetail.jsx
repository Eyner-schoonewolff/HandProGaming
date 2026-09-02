import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { toast } from "sonner";
import { ArrowLeft, Users, Check } from "lucide-react";

const ESTADO_BADGE = {
  pendiente: { label: "Pendiente", cls: "bg-slate-100 text-slate-600" },
  en_progreso: { label: "En progreso", cls: "bg-amber-100 text-amber-700" },
  entregada: { label: "Entregada", cls: "bg-sky-100 text-sky-700" },
  revisada: { label: "Revisada", cls: "bg-emerald-100 text-emerald-700" },
};

export default function ProfessorActivityDetail() {
  const { id } = useParams();
  const { db, user, asignarActividad } = useApp();
  const [sel, setSel] = useState(new Set());
  const actividad = db.actividades.find((a) => a.id === id);
  if (!actividad) return <div className="py-10 text-center text-slate-500">Actividad no encontrada.</div>;
  const curso = db.cursos.find((c) => c.id === actividad.cursoId);
  const matriculas = db.matriculas.filter((m) => m.cursoId === actividad.cursoId);
  const estudiantes = matriculas.map((m) => db.users.find((u) => u.id === m.estudianteId)).filter(Boolean);
  const asignaciones = db.asignaciones.filter((a) => a.actividadId === actividad.id);

  const toggle = (uid) => {
    setSel((s) => { const n = new Set(s); n.has(uid) ? n.delete(uid) : n.add(uid); return n; });
  };
  const todos = () => setSel(new Set(estudiantes.map((e) => e.id)));
  const ninguno = () => setSel(new Set());

  const asignar = () => {
    if (sel.size === 0) return toast.error("Selecciona al menos un estudiante");
    const n = asignarActividad(actividad.id, [...sel]);
    toast.success(`Asignada a ${n} estudiante(s)`);
    setSel(new Set());
  };

  return (
    <div className="space-y-6">
      <Link to="/profesor/cursos" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Volver
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs text-slate-400">{curso?.nombre}</p>
        <h1 className="text-xl font-bold text-slate-900">{actividad.titulo}</h1>
        <p className="mt-2 text-sm text-slate-600">{actividad.enunciado}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 font-medium text-indigo-700 capitalize">{actividad.dificultad}</span>
          {actividad.bloquesPermitidos.map((b) => (
            <span key={b} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">{b}</span>
          ))}
        </div>
      </div>

      {/* Asignar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Users size={16} className="text-teal-600" /> Asignar a estudiantes</h2>
          <div className="flex gap-2">
            <button onClick={todos} className="text-xs text-indigo-600 hover:underline">Seleccionar todos</button>
            <button onClick={ninguno} className="text-xs text-slate-400 hover:underline">Ninguno</button>
          </div>
        </div>
        {estudiantes.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Este curso no tiene estudiantes matriculados.</p>
        ) : (
          <>
            <div className="space-y-2">
              {estudiantes.map((u) => {
                const ya = asignaciones.some((a) => a.estudianteId === u.id);
                const checked = sel.has(u.id);
                return (
                  <label key={u.id} className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${checked ? "border-indigo-300 bg-indigo-50/50" : "border-slate-100 hover:bg-slate-50"}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(u.id)} className="h-4 w-4 accent-indigo-600" />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {u.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1"><p className="text-sm font-medium text-slate-800">{u.nombre}</p><p className="text-xs text-slate-400">{u.correo}</p></div>
                    {ya && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Ya asignada</span>}
                  </label>
                );
              })}
            </div>
            <button onClick={asignar} disabled={sel.size === 0}
              title={sel.size === 0 ? "Selecciona al menos un estudiante" : ""}
              className="mt-4 flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:bg-slate-300">
              <Check size={16} /> Asignar a {sel.size} estudiante(s)
            </button>
          </>
        )}
      </div>

      {/* Asignaciones existentes */}
      {asignaciones.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">Asignaciones existentes</h2>
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr><th className="px-4 py-2 font-medium">Estudiante</th><th className="px-4 py-2 font-medium">Estado</th><th className="px-4 py-2 font-medium">Fecha</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {asignaciones.map((a) => {
                  const est = db.users.find((u) => u.id === a.estudianteId);
                  return (
                    <tr key={a.id}>
                      <td className="px-4 py-2.5 text-slate-700">{est?.nombre}</td>
                      <td className="px-4 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ESTADO_BADGE[a.estado].cls}`}>{ESTADO_BADGE[a.estado].label}</span></td>
                      <td className="px-4 py-2.5 text-xs text-slate-400">{new Date(a.asignadaEn).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}