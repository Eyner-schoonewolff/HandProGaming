import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, Check, GraduationCap } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { toast } from "sonner";

export default function StudentCourses() {
  const { db, user, matricular } = useApp();
  const [q, setQ] = useState("");
  const misMatriculas = db.matriculas.filter((m) => m.estudianteId === user.id);
  const misCursos = misMatriculas.map((m) => db.cursos.find((c) => c.id === m.cursoId)).filter(Boolean);
  const catalogo = db.cursos.filter((c) => !misMatriculas.some((m) => m.cursoId === c.id));
  const filtrado = catalogo.filter((c) => c.nombre.toLowerCase().includes(q.toLowerCase()));

  const matricularse = (cursoId) => {
    const res = matricular(cursoId, user.id);
    if (res.ok) toast.success("Te has matriculado correctamente");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cursos</h1>
        <p className="text-sm text-slate-500">Tus cursos y el catálogo disponible</p>
      </div>

      {/* Mis cursos */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><GraduationCap size={16} className="text-indigo-600" /> Mis cursos</h2>
        {misCursos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center">
            <BookOpen size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm text-slate-500">Aún no estás matriculado en ningún curso.</p>
            <p className="text-xs text-slate-400">Explora el catálogo de abajo</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {misCursos.map((c) => {
              const prof = db.users.find((u) => u.id === c.profesorId);
              return (
                <Link key={c.id} to={`/estudiante/cursos/${c.id}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className={`mb-3 h-2 w-12 rounded-full bg-${c.color || "indigo"}-500`} />
                  <p className="text-base font-bold text-slate-900">{c.nombre}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.descripcion}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{prof?.nombre}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">Ya inscrito</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Catálogo */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><BookOpen size={16} className="text-teal-600" /> Catálogo disponible</h2>
        <div className="mb-4 relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar curso por nombre…"
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-400 focus:outline-none" />
        </div>
        {filtrado.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
            {q ? "Ningún curso coincide con la búsqueda." : "Aún no hay cursos publicados."}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtrado.map((c) => {
              const prof = db.users.find((u) => u.id === c.profesorId);
              return (
                <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className={`mb-3 h-2 w-12 rounded-full bg-${c.color || "indigo"}-500`} />
                  <p className="text-base font-bold text-slate-900">{c.nombre}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.descripcion}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{prof?.nombre}</span>
                    <button onClick={() => matricularse(c.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
                      <Check size={13} /> Matricularme
                    </button>
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