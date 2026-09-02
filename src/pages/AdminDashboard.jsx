import React from "react";
import { Users, BookOpen, ClipboardList, GraduationCap, UserCog } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function AdminDashboard() {
  const { db } = useApp();
  const porRol = {
    estudiante: db.users.filter((u) => u.rol === "estudiante").length,
    profesor: db.users.filter((u) => u.rol === "profesor").length,
    admin: db.users.filter((u) => u.rol === "admin").length,
  };
  const stats = [
    { label: "Usuarios totales", value: db.users.length, icon: Users, color: "indigo" },
    { label: "Cursos", value: db.cursos.length, icon: BookOpen, color: "teal" },
    { label: "Actividades", value: db.actividades.length, icon: ClipboardList, color: "violet" },
    { label: "Entregas", value: db.entregas.length, icon: ClipboardList, color: "amber" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel del administrador</h1>
        <p className="text-sm text-slate-500">Métricas generales de la plataforma</p>
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-slate-800">Usuarios por rol</h2>
          <div className="space-y-3">
            {[
              { rol: "estudiante", label: "Estudiantes", icon: GraduationCap, color: "indigo", n: porRol.estudiante },
              { rol: "profesor", label: "Profesores", icon: UserCog, color: "teal", n: porRol.profesor },
              { rol: "admin", label: "Administradores", icon: Users, color: "violet", n: porRol.admin },
            ].map((r) => (
              <div key={r.rol} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-${r.color}-100 text-${r.color}-600`}><r.icon size={18} /></div>
                <span className="flex-1 text-sm text-slate-700">{r.label}</span>
                <span className="text-lg font-bold text-slate-900">{r.n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-slate-800">Cursos por profesor</h2>
          <div className="space-y-2">
            {db.users.filter((u) => u.rol === "profesor").map((p) => {
              const n = db.cursos.filter((c) => c.profesorId === p.id).length;
              return (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <span className="text-sm text-slate-700">{p.nombre}</span>
                  <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700">{n} cursos</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}