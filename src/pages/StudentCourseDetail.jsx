import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, ClipboardList } from "lucide-react";
import { useApp } from "@/lib/AppContext";

const ESTADO_BADGE = {
  pendiente: { label: "Pendiente", cls: "bg-slate-100 text-slate-600" },
  en_progreso: { label: "En progreso", cls: "bg-amber-100 text-amber-700" },
  entregada: { label: "Entregada", cls: "bg-sky-100 text-sky-700" },
  revisada: { label: "Revisada", cls: "bg-emerald-100 text-emerald-700" },
};

export default function StudentCourseDetail() {
  const { cursoId } = useParams();
  const { db, user } = useApp();
  const curso = db.cursos.find((c) => c.id === cursoId);
  if (!curso) return <div className="py-10 text-center text-slate-500">Curso no encontrado.</div>;
  const prof = db.users.find((u) => u.id === curso.profesorId);
  const actividades = db.actividades.filter((a) => a.cursoId === curso.id);
  const misAsignaciones = db.asignaciones.filter((a) => a.estudianteId === user.id);

  return (
    <div className="space-y-6">
      <Link to="/estudiante/cursos" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Volver a cursos
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className={`mb-3 h-2 w-14 rounded-full bg-${curso.color || "indigo"}-500`} />
        <h1 className="text-2xl font-bold text-slate-900">{curso.nombre}</h1>
        <p className="mt-2 text-sm text-slate-600">{curso.descripcion}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
          <span>Profesor: <strong className="text-slate-600">{prof?.nombre}</strong></span>
          <span>Código: <strong className="text-slate-600">{curso.codigo}</strong></span>
          <span>{actividades.length} actividades</span>
        </div>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><ClipboardList size={16} className="text-indigo-600" /> Actividades del curso</h2>
        {actividades.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
            Este curso aún no tiene actividades.
          </div>
        ) : (
          <div className="space-y-2">
            {actividades.map((a) => {
              const asig = misAsignaciones.find((x) => x.actividadId === a.id);
              const estado = asig?.estado || "pendiente";
              return (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">{a.titulo}</p>
                    <p className="text-xs text-slate-400">Dificultad: {a.dificultad}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ESTADO_BADGE[estado].cls}`}>{ESTADO_BADGE[estado].label}</span>
                    {asig ? (
                      <Link to={`/estudiante/actividades/${asig.id}`} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                        Abrir
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">No asignada</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}