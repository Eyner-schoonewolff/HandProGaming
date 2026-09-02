import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, BookOpen, TrendingUp, MessageSquare, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/AppContext";

const ESTADO_BADGE = {
  pendiente: { label: "Pendiente", cls: "bg-slate-100 text-slate-600" },
  en_progreso: { label: "En progreso", cls: "bg-amber-100 text-amber-700" },
  entregada: { label: "Entregada", cls: "bg-sky-100 text-sky-700" },
  revisada: { label: "Revisada", cls: "bg-emerald-100 text-emerald-700" },
};

export default function StudentDashboard() {
  const { db, user } = useApp();
  const misMatriculas = db.matriculas.filter((m) => m.estudianteId === user.id);
  const misCursos = misMatriculas.map((m) => db.cursos.find((c) => c.id === m.cursoId)).filter(Boolean);
  const misAsignaciones = db.asignaciones.filter((a) => a.estudianteId === user.id);
  const pendientes = misAsignaciones.filter((a) => a.estado === "pendiente" || a.estado === "en_progreso");
  const revisadas = misAsignaciones.filter((a) => a.estado === "revisada");
  const retroReciente = db.retro
    .filter((r) => {
      const ent = db.entregas.find((e) => e.id === r.entregaId);
      const asig = ent && db.asignaciones.find((a) => a.id === ent.asignacionId);
      return asig && asig.estudianteId === user.id;
    })
    .slice(-2).reverse();

  const stats = [
    { label: "Actividades pendientes", value: pendientes.length, icon: ClipboardList, color: "indigo" },
    { label: "Cursos matriculados", value: misCursos.length, icon: BookOpen, color: "teal" },
    { label: "Actividades revisadas", value: revisadas.length, icon: CheckCircle2, color: "emerald" },
    { label: "Retroalimentaciones", value: retroReciente.length, icon: MessageSquare, color: "violet" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hola, {user.nombre.split(" ")[0]} 👋</h1>
        <p className="text-sm text-slate-500">Continúa aprendiendo lógica con bloques visuales</p>
      </div>

      {/* Stats */}
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
        {/* Pendientes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Clock size={16} className="text-indigo-600" /> Actividades pendientes</h2>
            <Link to="/estudiante/actividades" className="text-xs font-medium text-indigo-600 hover:underline">Ver todas</Link>
          </div>
          {pendientes.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 size={32} className="mb-2 text-emerald-400" />
              <p className="text-sm text-slate-500">No tienes actividades pendientes.</p>
              <Link to="/estudiante/cursos" className="mt-2 text-xs font-medium text-indigo-600 hover:underline">Explora tus cursos</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {pendientes.slice(0, 5).map((a) => {
                const act = db.actividades.find((x) => x.id === a.actividadId);
                const curso = act && db.cursos.find((c) => c.id === act.cursoId);
                if (!act) return null;
                return (
                  <Link key={a.id} to={`/estudiante/actividades/${a.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{act.titulo}</p>
                      <p className="text-xs text-slate-400">{curso?.nombre}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ESTADO_BADGE[a.estado].cls}`}>{ESTADO_BADGE[a.estado].label}</span>
                      <ArrowRight size={15} className="text-slate-300" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Retroalimentación reciente */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800"><MessageSquare size={16} className="text-violet-600" /> Retroalimentación reciente</h2>
          {retroReciente.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <AlertCircle size={32} className="mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">Aún no tienes retroalimentación.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {retroReciente.map((r) => {
                const ent = db.entregas.find((e) => e.id === r.entregaId);
                const asig = ent && db.asignaciones.find((a) => a.id === ent.asignacionId);
                const act = asig && db.actividades.find((x) => x.id === asig.actividadId);
                return (
                  <div key={r.id} className="rounded-xl border border-violet-100 bg-violet-50/40 p-3">
                    <p className="text-xs font-semibold text-violet-700">{act?.titulo}</p>
                    <p className="mt-1 text-sm text-slate-700">"{r.comentario}"</p>
                    {r.calificacion && <p className="mt-1 text-[11px] text-slate-400">Calificación: {r.calificacion}/5</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cursos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><BookOpen size={16} className="text-teal-600" /> Mis cursos</h2>
          <Link to="/estudiante/cursos" className="text-xs font-medium text-indigo-600 hover:underline">Ver catálogo</Link>
        </div>
        {misCursos.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">Aún no estás matriculado en ningún curso.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {misCursos.map((c) => (
              <Link key={c.id} to={`/estudiante/cursos/${c.id}`} className="rounded-xl border border-slate-100 p-4 transition hover:border-teal-200 hover:shadow-sm">
                <div className={`mb-2 h-1.5 w-10 rounded-full bg-${c.color || "indigo"}-500`} />
                <p className="text-sm font-bold text-slate-800">{c.nombre}</p>
                <p className="text-xs text-slate-400">{c.totalActividades} actividades</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}