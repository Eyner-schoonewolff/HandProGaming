import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { toast } from "sonner";
import { Search, Users, ShieldCheck, X } from "lucide-react";

const ROLES = ["estudiante", "profesor", "admin"];

export default function AdminUsers() {
  const { db, user, updateUser, toggleUserActivo } = useApp();
  const [q, setQ] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [editando, setEditando] = useState(null);

  const filtrados = db.users.filter((u) => {
    const matchQ = !q || u.nombre.toLowerCase().includes(q.toLowerCase()) || u.correo.toLowerCase().includes(q.toLowerCase());
    const matchRol = filtroRol === "todos" || u.rol === filtroRol;
    return matchQ && matchRol;
  });

  const cambiarRol = (id, rol) => {
    updateUser(id, { rol });
    toast.success("Rol actualizado");
    setEditando(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
        <p className="text-sm text-slate-500">Gestiona las cuentas de la plataforma</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o correo…"
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-400 focus:outline-none" />
        </div>
        <div className="flex gap-2">
          {["todos", ...ROLES].map((r) => (
            <button key={r} onClick={() => setFiltroRol(r)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${filtroRol === r ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
          <Users size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">Ningún usuario coincide con la búsqueda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Creado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtrados.map((u) => {
                const esYo = u.id === user.id;
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
                    <td className="px-4 py-3">
                      {editando === u.id ? (
                        <select defaultValue={u.rol} onChange={(e) => cambiarRol(u.id, e.target.value)} className="rounded border border-slate-200 px-2 py-1 text-xs capitalize">
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium capitalize text-slate-600">{u.rol}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${u.activo ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{new Date(u.creadoEn).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      {esYo ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400"><ShieldCheck size={13} /> Tú</span>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditando(editando === u.id ? null : u.id)} className="text-xs font-medium text-indigo-600 hover:underline">
                            {editando === u.id ? "Cancelar" : "Cambiar rol"}
                          </button>
                          <button onClick={() => { toggleUserActivo(u.id); toast.success(u.activo ? "Usuario desactivado" : "Usuario activado"); }}
                            className="text-xs font-medium text-slate-500 hover:text-rose-600">
                            {u.activo ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      )}
                    </td>
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