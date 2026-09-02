import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { toast } from "sonner";
import { BookOpen, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

const COLORES = ["indigo", "teal", "violet", "rose", "emerald", "amber", "sky", "orange"];

export default function ProfessorCourses() {
  const { db, user, crearCurso } = useApp();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", codigo: "", color: "indigo" });

  const misCursos = db.cursos.filter((c) => c.profesorId === user.id);

  const crear = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return toast.error("Escribe un nombre");
    crearCurso({ ...form, profesorId: user.id, totalActividades: 0 });
    toast.success("Curso creado");
    setForm({ nombre: "", descripcion: "", codigo: "", color: "indigo" });
    setShow(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis cursos</h1>
          <p className="text-sm text-slate-500">Gestiona los cursos que dictas</p>
        </div>
        <button onClick={() => setShow(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={16} /> Nuevo curso
        </button>
      </div>

      {misCursos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
          <BookOpen size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">Aún no has creado ningún curso.</p>
          <button onClick={() => setShow(true)} className="mt-3 text-xs font-medium text-indigo-600 hover:underline">Crear mi primer curso</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {misCursos.map((c) => (
            <Link key={c.id} to={`/profesor/cursos/${c.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className={`mb-3 h-2 w-12 rounded-full bg-${c.color || "indigo"}-500`} />
              <p className="text-base font-bold text-slate-900">{c.nombre}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.descripcion}</p>
              <p className="mt-3 text-xs text-slate-400">{c.totalActividades} actividades · {c.codigo}</p>
            </Link>
          ))}
        </div>
      )}

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Nuevo curso</h3>
              <button onClick={() => setShow(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={crear} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Código</label>
                <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="LOG-101" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORES.map((col) => (
                    <button type="button" key={col} onClick={() => setForm({ ...form, color: col })}
                      className={`h-7 w-7 rounded-full bg-${col}-500 ${form.color === col ? "ring-2 ring-slate-900 ring-offset-2" : ""}`} />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Crear curso</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}