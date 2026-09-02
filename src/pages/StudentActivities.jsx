import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Filter, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/AppContext";

const ESTADOS = [
  { id: "todos", label: "Todos" },
  { id: "pendiente", label: "Pendientes" },
  { id: "en_progreso", label: "En progreso" },
  { id: "entregada", label: "Entregadas" },
  { id: "revisada", label: "Revisadas" },
];

const ESTADO_BADGE = {
  pendiente: { label: "Pendiente", cls: "bg-slate-100 text-slate-600" },
  en_progreso: { label: "En progreso", cls: "bg-amber-100 text-amber-700" },
  entregada: { label: "Entregada", cls: "bg-sky-100 text-sky-700" },
  revisada: { label: "Revisada", cls: "bg-emerald-100 text-emerald-700" },
};

export default function StudentActivities() {
  const { db, user } = useApp();
  const [filtro, setFiltro] = useState("todos");
  const misAsignaciones = db.asignaciones.filter((a) => a.estudianteId === user.id);
  const filtradas = filtro === "todos" ? misAsignaciones : misAsignaciones.filter((a) => a.estado === filtro);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis actividades</h1>
        <p className="text-sm text-slate-500">Filtra y trabaja en las actividades que te asignaron</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={15} className="text-slate-400" />
        {ESTADOS.map((e) => (
          <button key={e.id} onClick={() => setFiltro(e.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filtro === e.id ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}>
            {e.label}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
          <ClipboardList size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">No tienes actividades en este estado.</p>
          <Link to="/estudiante/cursos" className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline">Explora tus cursos</Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtradas.map((a) => {
            const act = db.actividades.find((x) => x.id === a.actividadId);
            const curso = act && db.cursos.find((c) => c.id === act.cursoId);
            if (!act) return null;
            const vencida = act.fechaLimite && new Date(act.fechaLimite) < new Date() && a.estado === "pendiente";
            return (
              <Link key={a.id} to={`/estudiante/actividades/${a.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">{act.titulo}</p>
                    <p className="text-xs text-slate-400">{curso?.nombre}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ESTADO_BADGE[a.estado].cls}`}>{ESTADO_BADGE[a.estado].label}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-slate-500">{act.enunciado}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Dificultad: <span className="font-medium text-slate-600">{act.dificultad}</span>
                    {act.fechaLimite && <span className="ml-2">· Vence: {act.fechaLimite}</span>}
                    {vencida && <span className="ml-2 text-rose-500 font-medium">· Fuera de plazo</span>}
                  </span>
                  <ArrowRight size={15} className="text-slate-300 group-hover:text-indigo-500" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}