import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hand, Mail, Lock, User, Eye, EyeOff, GraduationCap, UserCog, ShieldCheck, Check } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { toast } from "sonner";

const ROLES = [
  { id: "estudiante", icon: GraduationCap, color: "indigo", title: "Estudiante", desc: "Aprende resolviendo actividades con bloques" },
  { id: "profesor", icon: UserCog, color: "teal", title: "Profesor", desc: "Crea cursos, actividades y revisa entregas" },
  { id: "admin", icon: ShieldCheck, color: "violet", title: "Administrador", desc: "Gestiona usuarios y toda la plataforma" },
];

export default function Register() {
  const { register, user } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", correo: "", password: "", confirm: "" });
  const [rol, setRol] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate(`/${user.rol}`, { replace: true }); }, [user]);

  const fuerza = form.password.length >= 8 ? "ok" : form.password.length > 0 ? "weak" : "";

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim()) return setError("Escribe tu nombre.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) return setError("Correo con formato inválido.");
    if (form.password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (form.password !== form.confirm) return setError("Las contraseñas no coinciden.");
    if (!rol) return setError("Selecciona un rol para continuar.");
    setLoading(true);
    setTimeout(() => {
      const res = register({ ...form, rol });
      setLoading(false);
      if (!res.ok) { setError(res.error); return; }
      toast.success(`Cuenta creada. ¡Bienvenido, ${res.user.nombre}!`);
      navigate(`/${rol}`);
    }, 400);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-teal-50/40 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-md">
              <Hand size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900">HandProGaming</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
          <h1 className="text-xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">Elige tu rol y completa tus datos</p>

          {/* Selector de rol */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ROLES.map((r) => {
              const sel = rol === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRol(r.id)}
                  className={`relative rounded-xl border-2 p-3 text-left transition ${
                    sel ? `border-${r.color}-500 bg-${r.color}-50` : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {sel && (
                    <span className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-${r.color}-500 text-white`}>
                      <Check size={12} />
                    </span>
                  )}
                  <r.icon size={22} className={sel ? `text-${r.color}-600` : "text-slate-400"} />
                  <p className="mt-2 text-sm font-bold text-slate-800">{r.title}</p>
                  <p className="text-[11px] leading-snug text-slate-500">{r.desc}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Nombre completo</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ana Martínez"
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Correo</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} placeholder="ana@demo.co"
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={show ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-10 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <p className={`mt-1 text-[11px] ${fuerza === "ok" ? "text-emerald-600" : "text-amber-600"}`}>
                    {fuerza === "ok" ? "Contraseña válida" : "Demasiado corta"}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Confirmar</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={show ? "text" : "password"} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Repite la contraseña"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div>
            </div>

            {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</div>}

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60">
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Hand size={16} />}
              {loading ? "Creando…" : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-indigo-600 hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}