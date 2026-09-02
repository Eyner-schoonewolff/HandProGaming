import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Users, ClipboardList, Plus } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function ProfessorCourseDetail() {
  const { cursoId } = useParams();
  const { db, user } = useApp();
  const curso = db.cursos.find((c) => c.id === cursoId);
  if (!curso) return <div className="py-10 text-center text-slate-500">Curso no encontrado.</div>;
  const actividades = db.actividades.filter((a) => a.cursoId === curso.id);
  const matriculas = db.matriculas.filter((m) => m.cursoId === curso.id);
  const estudiantes = matriculas.map((m) => db.users.find((u) => u.id === m.estudianteId)).filter(Boolean);

  return (
    <div className="space-y-6">
      <Link to="/profesor/cursos" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Volver a cursos
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className={`mb-3 h-2 w-14 rounded-full bg-${curso.color || "indigo"}-500`} />
        <h1 className="text-2xl font-bold text-slate-900">{curso.nombre}</h1>
        <p className="mt-2 text-sm text-slate-600">{curso.descripcion}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Actividades */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><ClipboardList size={16} className="text-indigo-600" /> Actividades</h2>
            <Link to="/profesor/actividades/nueva" className="text-xs font-medium text-indigo-600 hover:underline">+ Crear</Link>
          </div>
          {actividades.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Sin actividades. Crea la primera.</p>
          ) : (
            <div className="space-y-2">
              {actividades.map((a) => (
                <Link key={a.id} to={`/profesor/actividades/${a.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:border-indigo-200 hover:bg-indigo-50/40">
                  <div><p className="text-sm font-semibold text-slate-800">{a.titulo}</p><p className="text-xs text-slate-400 capitalize">{a.dificultad}</p></div>
                  <Plus size={15} className="text-slate-300" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Estudiantes matriculados */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800"><Users size={16} className="text-teal-600" /> Estudiantes matriculados</h2>
          {estudiantes.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Aún no hay estudiantes matriculados.</p>
          ) : (
            <div className="space-y-2">
              {estudiantes.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                    {u.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div><p className="text-sm font-medium text-slate-800">{u.nombre}</p><p className="text-xs text-slate-400">{u.correo}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}