import React from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function ProfessorStudents() {
  const { db, user } = useApp();
  const misCursos = db.cursos.filter((c) => c.profesorId === user.id);
  const matriculas = db.matriculas.filter((m) => misCursos.some((c) => c.id === m.cursoId));
  const estudiantes = [...new Set(matriculas.map((m) => m.estudianteId))]
    .map((id) => db.users.find((u) => u.id === id)).filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Estudiantes</h1>
        <p className="text-sm text-slate-500">Progreso de los estudiantes matriculados en tus cursos</p>
      </div>

      {estudiantes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
          <Users size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">Aún no tienes estudiantes matriculados.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Estudiante</th>
                <th className="px-4 py-3 font-medium">Cursos</th>
                <th className="px-4 py-3 font-medium">Asignadas</th>
                <th className="px-4 py-3 font-medium">Entregadas</th>
                <th className="px-4 py-3 font-medium">Revisadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {estudiantes.map((u) => {
                const cursosEst = misCursos.filter((c) => matriculas.some((m) => m.cursoId === c.id && m.estudianteId === u.id));
                const asigs = db.asignaciones.filter((a) => a.estudianteId === u.id && cursosEst.some((c) => c.id === db.actividades.find((x) => x.id === a.actividadId)?.cursoId));
                const entregadas = asigs.filter((a) => a.estado === "entregada" || a.estado === "revisada").length;
                const revisadas = asigs.filter((a) => a.estado === "revisada").length;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                          {u.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </div>
                        <div><p className="font-medium text-slate-800">{u.nombre}</p><p className="text-xs text-slate-400">{u.correo}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{cursosEst.length}</td>
                    <td className="px-4 py-3 text-slate-600">{asigs.length}</td>
                    <td className="px-4 py-3 text-slate-600">{entregadas}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">{revisadas}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}