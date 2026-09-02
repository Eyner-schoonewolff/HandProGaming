import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Home, BookOpen, ClipboardList, TrendingUp, HelpCircle, Code2,
  LayoutDashboard, Users, GraduationCap, FileCheck, Settings,
  LogOut, Menu, X, Hand
} from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { BLOQUES } from "@/lib/blocks";

const NAV = {
  estudiante: [
    { to: "/estudiante", label: "Panel", icon: Home, end: true },
    { to: "/estudiante/cursos", label: "Cursos", icon: BookOpen },
    { to: "/estudiante/actividades", label: "Mis actividades", icon: ClipboardList },
    { to: "/estudiante/progreso", label: "Mi progreso", icon: TrendingUp },
    { to: "/estudiante/tutorial", label: "Tutorial de gestos", icon: HelpCircle },
    { to: "/editor", label: "Editor libre", icon: Code2 },
    { to: "/configuracion", label: "Configuración", icon: Settings },
  ],
  profesor: [
    { to: "/profesor", label: "Panel", icon: Home, end: true },
    { to: "/profesor/cursos", label: "Mis cursos", icon: BookOpen },
    { to: "/profesor/actividades/nueva", label: "Crear actividad", icon: ClipboardList },
    { to: "/profesor/entregas", label: "Entregas por revisar", icon: FileCheck },
    { to: "/profesor/estudiantes", label: "Estudiantes", icon: Users },
    { to: "/editor", label: "Editor (vista previa)", icon: Code2 },
    { to: "/configuracion", label: "Configuración", icon: Settings },
  ],
  admin: [
    { to: "/admin", label: "Panel", icon: LayoutDashboard, end: true },
    { to: "/admin/usuarios", label: "Usuarios", icon: Users },
    { to: "/admin/cursos", label: "Cursos", icon: BookOpen },
    { to: "/configuracion", label: "Configuración", icon: Settings },
  ],
};

const ROL_LABEL = { estudiante: "Estudiante", profesor: "Profesor", admin: "Administrador" };

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
          isActive
            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!user) return <Outlet />;

  const items = NAV[user.rol] || [];
  const initials = (user.nombre || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Miga simple basada en la ruta
  const crumbs = location.pathname.split("/").filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-sm">
            <Hand size={20} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">HandProGaming</p>
            <p className="text-[11px] text-slate-400">Lógica con bloques</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((it) => <NavItem key={it.to} {...it} />)}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-slate-900">{user.nombre}</p>
              <p className="text-[11px] text-slate-400">{ROL_LABEL[user.rol]}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Topbar móvil */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-teal-500 text-white">
            <Hand size={18} />
          </div>
          <span className="font-bold text-slate-900">HandProGaming</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Drawer móvil */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="font-bold text-slate-900">Menú</span>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3" onClick={() => setOpen(false)}>
              {items.map((it) => <NavItem key={it.to} {...it} />)}
            </nav>
            <button
              onClick={handleLogout}
              className="m-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </aside>
        </div>
      )}

      {/* Contenido */}
      <div className="lg:pl-64">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {crumbs.length > 0 && (
            <nav className="mb-5 flex items-center gap-1.5 text-xs text-slate-400">
              <Link to={`/${user.rol}`} className="hover:text-slate-600">Inicio</Link>
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span>/</span>
                  <span className={i === crumbs.length - 1 ? "font-medium text-slate-600" : ""}>{c}</span>
                </span>
              ))}
            </nav>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}