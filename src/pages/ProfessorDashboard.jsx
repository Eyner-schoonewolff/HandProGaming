import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileCheck, Users, ClipboardList, ArrowRight, Plus } from "lucide-react";
import { useApp } from "@/lib/AppContext";

const ESTADO_BADGE = {
  pendiente: { label: "Pendiente", cls: "bg-slate-100 text-slate-600" },
  en_progreso: { label: "En progreso", cls: "bg-amber-100 text-amber-700" },
  entregada: { label: "Entregada", cls: "bg-sky-100 text-sky-700" },
  revisada: { label: "Revisada", cls: "bg-emerald-100 text-emerald-700" },
};

export default function ProfessorDashboard() {
  const { db, user } = useApp();
  const misCursos = db.cursos.filter((c) => c.profesorId === user.id);
  const misActividades = db.actividades.filter((a) => misCursos.some((c) => c.id === a.cursoId));
  const entregasPorRevisar = db.entregas.filter((e) => {
    const asig = db.asignaciones.find((a) => a.id === e.asignacionId);
    return asig && misActividades.some((x) => x.id === asig.actividadId) && asig.estado === "entregada";
  });
  const estudiantesIds = new Set();
  db.matriculas.filter((m) => misCursos.some((c) => c.id === m.cursoId)).forEach((m) => estudiantesIds.add(m.estudianteId));

  const stats = [
    { label: "Mis cursos", value: misCursos.length, icon: BookOpen, color: "teal" },
    { label: "Actividades creadas", value: misActividades.length, icon: ClipboardList, color: "indigo" },
    { label: "Entregas por revisar", value: entregasPorRevisar.length, icon: FileCheck, color: "amber" },
    { label: "Estudiantes", value: estudiantesIds.size, icon: Users, color: "violet" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel del profesor</h1>
          <p className="text-sm text-slate-500">Hola, {user.nombre.split(" ")[0]}</p>
        </div>
        <Link to="/profesor/actividades/nueva" className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={16} /> Nueva actividad
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-${s.color}-100 text-${s.color}-600`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Entregas por revisar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><FileCheck size={16} className="text-amber-600" /> Entregas por revisar</h2>
            <Link to="/profesor/entregas" className="text-xs font-medium text-indigo-600 hover:underline">Ver bandeja</Link>
          </div>
          {entregasPorRevisar.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">No hay entregas pendientes de revisión. 🎉</div>
          ) : (
            <div className="space-y-2">
              {entregasPorRevisar.slice(0, 5).map((e) => {
                const asig = db.asignaciones.find((a) => a.id === e.asignacionId);
                const act = asig && db.actividades.find((x) => x.id === asig.actividadId);
                const est = asig && db.users.find((u) => u.id === asig.estudianteId);
                return (
                  <Link key={e.id} to={`/profesor/entregas/${e.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:border-amber-200 hover:bg-amber-50/40">
                    <div><p className="text-sm font-semibold text-slate-800">{act?.titulo}</p><p className="text-xs text-slate-400">{est?.nombre}</p></div>
                    <ArrowRight size={15} className="text-slate-300" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Mis cursos */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><BookOpen size={16} className="text-teal-600" /> Mis cursos</h2>
            <Link to="/profesor/cursos" className="text-xs font-medium text-indigo-600 hover:underline">Ver todos</Link>
          </div>
          {misCursos.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">Aún no has creado cursos.</div>
          ) : (
            <div className="space-y-2">
              {misCursos.map((c) => (
                <Link key={c.id} to={`/profesor/cursos/${c.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:border-teal-200 hover:bg-teal-50/40">
                  <div><p className="text-sm font-semibold text-slate-800">{c.nombre}</p><p className="text-xs text-slate-400">{c.totalActividades} actividades</p></div>
                  <ArrowRight size={15} className="text-slate-300" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}