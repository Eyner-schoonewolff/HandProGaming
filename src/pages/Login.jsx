import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hand, Mail, Lock, Eye, EyeOff, LogIn, GraduationCap, UserCog, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { toast } from "sonner";

export default function Login() {
  const { login, loginDemo, user } = useApp();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(`/${user.rol}`, { replace: true });
  }, [user]);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!correo.trim() || !password) {
      setError("Completa todos los campos.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = login(correo, password);
      setLoading(false);
      if (!res.ok) { setError(res.error); return; }
      toast.success(`Bienvenido, ${res.user.nombre}`);
      navigate(`/${res.user.rol}`);
    }, 400);
  };

  const demo = (rol) => {
    const res = loginDemo(rol);
    if (res.ok) { toast.success(`Entraste como ${rol}`); navigate(`/${rol}`); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-teal-50/40 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-md">
              <Hand size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900">HandProGaming</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
          <h1 className="text-xl font-bold text-slate-900">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-slate-500">Accede a tu panel según tu rol</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Correo</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ana@demo.co"
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-10 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <LogIn size={16} />}
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[11px] text-slate-400">o entra con una demo</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => demo("estudiante")} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50">
              <GraduationCap size={18} className="text-indigo-600" /> Estudiante
            </button>
            <button onClick={() => demo("profesor")} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-xs font-medium text-slate-600 transition hover:border-teal-300 hover:bg-teal-50">
              <UserCog size={18} className="text-teal-600" /> Profesor
            </button>
            <button onClick={() => demo("admin")} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-xs font-medium text-slate-600 transition hover:border-violet-300 hover:bg-violet-50">
              <ShieldCheck size={18} className="text-violet-600" /> Admin
            </button>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            ¿No tienes cuenta? <Link to="/registro" className="font-semibold text-indigo-600 hover:underline">Regístrate</Link>
          </p>
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-400">Demos: ana@demo.co · luis@demo.co · admin@demo.co · contraseña: demo1234</p>
      </div>
    </div>
  );
}