import React from "react";
import { TrendingUp, CheckCircle2, Clock, Award } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function StudentProgress() {
  const { db, user } = useApp();
  const misAsignaciones = db.asignaciones.filter((a) => a.estudianteId === user.id);
  const total = misAsignaciones.length;
  const revisadas = misAsignaciones.filter((a) => a.estado === "revisada").length;
  const entregadas = misAsignaciones.filter((a) => a.estado === "entregada").length;
  const pendientes = misAsignaciones.filter((a) => a.estado === "pendiente" || a.estado === "en_progreso").length;
  const progreso = total > 0 ? Math.round((revisadas / total) * 100) : 0;

  const retos = db.retro.filter((r) => {
    const ent = db.entregas.find((e) => e.id === r.entregaId);
    const asig = ent && db.asignaciones.find((a) => a.id === ent.asignacionId);
    return asig && asig.estudianteId === user.id;
  });

  const conceptos = new Set();
  misAsignaciones.forEach((a) => {
    const act = db.actividades.find((x) => x.id === a.actividadId);
    if (act) act.bloquesPermitidos.forEach((b) => conceptos.add(b));
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi progreso</h1>
        <p className="text-sm text-slate-500">Resumen de tu aprendizaje</p>
      </div>

      {/* Barra de progreso */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><TrendingUp size={16} className="text-indigo-600" /> Progreso general</h2>
          <span className="text-sm font-bold text-indigo-600">{progreso}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 transition-all" style={{ width: `${progreso}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">{revisadas} de {total} actividades revisadas</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Revisadas", value: revisadas, icon: CheckCircle2, color: "emerald" },
          { label: "Entregadas", value: entregadas, icon: Clock, color: "sky" },
          { label: "Pendientes", value: pendientes, icon: Award, color: "amber" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-${s.color}-100 text-${s.color}-600`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Conceptos practicados */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-slate-800">Conceptos practicados</h2>
        {conceptos.size === 0 ? (
          <p className="text-sm text-slate-500">Aún no has practicado conceptos.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {[...conceptos].map((c) => (
              <span key={c} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 capitalize">{c}</span>
            ))}
          </div>
        )}
      </div>

      {/* Historial de retroalimentación */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-slate-800">Historial de retroalimentación</h2>
        {retos.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no has recibido retroalimentación.</p>
        ) : (
          <div className="space-y-3">
            {[...retos].reverse().map((r) => {
              const ent = db.entregas.find((e) => e.id === r.entregaId);
              const asig = ent && db.asignaciones.find((a) => a.id === ent.asignacionId);
              const act = asig && db.actividades.find((x) => x.id === asig.actividadId);
              return (
                <div key={r.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{act?.titulo}</p>
                    {r.calificacion && <span className="text-xs font-bold text-violet-600">{r.calificacion}/5</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">"{r.comentario}"</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}