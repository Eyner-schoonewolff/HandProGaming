import React from "react";
import { Link } from "react-router-dom";
import { FileCheck, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/AppContext";

const ESTADO_BADGE = {
  pendiente: { label: "Pendiente", cls: "bg-slate-100 text-slate-600" },
  en_progreso: { label: "En progreso", cls: "bg-amber-100 text-amber-700" },
  entregada: { label: "Entregada", cls: "bg-sky-100 text-sky-700" },
  revisada: { label: "Revisada", cls: "bg-emerald-100 text-emerald-700" },
};

export default function ProfessorDeliveries() {
  const { db, user } = useApp();
  const misCursos = db.cursos.filter((c) => c.profesorId === user.id);
  const misActividades = db.actividades.filter((a) => misCursos.some((c) => c.id === a.cursoId));
  const entregas = db.entregas.filter((e) => {
    const asig = db.asignaciones.find((a) => a.id === e.asignacionId);
    return asig && misActividades.some((x) => x.id === asig.actividadId);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Entregas</h1>
        <p className="text-sm text-slate-500">Revisa las entregas de tus estudiantes</p>
      </div>

      {entregas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
          <FileCheck size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">No hay entregas pendientes.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entregas.map((e) => {
            const asig = db.asignaciones.find((a) => a.id === e.asignacionId);
            const act = asig && db.actividades.find((x) => x.id === asig.actividadId);
            const est = asig && db.users.find((u) => u.id === asig.estudianteId);
            const revisada = asig?.estado === "revisada";
            return (
              <Link key={e.id} to={`/profesor/entregas/${e.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
                    {est?.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{act?.titulo}</p>
                    <p className="text-xs text-slate-400">{est?.nombre} · {new Date(e.entregadaEn).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${revisada ? ESTADO_BADGE.revisada.cls : ESTADO_BADGE.entregada.cls}`}>
                    {revisada ? "Revisada" : "Por revisar"}
                  </span>
                  <ArrowRight size={15} className="text-slate-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}