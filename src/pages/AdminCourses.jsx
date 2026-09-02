import React from "react";
import { BookOpen } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function AdminCourses() {
  const { db } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cursos</h1>
        <p className="text-sm text-slate-500">Catálogo completo de cursos de la plataforma</p>
      </div>

      {db.cursos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
          <BookOpen size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">No hay cursos registrados.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Curso</th>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Profesor</th>
                <th className="px-4 py-3 font-medium">Actividades</th>
                <th className="px-4 py-3 font-medium">Estudiantes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {db.cursos.map((c) => {
                const prof = db.users.find((u) => u.id === c.profesorId);
                const nActs = db.actividades.filter((a) => a.cursoId === c.id).length;
                const nEst = db.matriculas.filter((m) => m.cursoId === c.id).length;
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full bg-${c.color || "indigo"}-500`} />
                        <div><p className="font-medium text-slate-800">{c.nombre}</p><p className="text-xs text-slate-400">{c.descripcion}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.codigo}</td>
                    <td className="px-4 py-3 text-slate-600">{prof?.nombre || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{nActs}</td>
                    <td className="px-4 py-3 text-slate-600">{nEst}</td>
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