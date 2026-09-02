import React from "react";
import { Link } from "react-router-dom";
import { Hand, MousePointer, Keyboard, Camera, ArrowRight, Blocks, Play, GraduationCap, UserCog } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-indigo-50/40">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-md">
            <Hand size={22} />
          </div>
          <span className="text-lg font-bold text-slate-900">HandProGaming</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Iniciar sesión</Link>
          <Link to="/registro" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">Crear cuenta</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
          <Blocks size={13} /> Aprende programación con bloques visuales
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Lógica de programación <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">con tus manos</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Una plataforma educativa donde construyes programas arrastrando bloques y puedes
          controlar el lienzo con gestos de tu mano detectados por la cámara. Sin escribir código.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/registro" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700">
            Empezar gratis <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Ver demo
          </Link>
        </div>
      </section>

      {/* Demo visual */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-700"><Play size={16} /><span className="text-xs font-bold">Inicio</span></div>
              <div className="rounded-lg bg-sky-50 p-3 text-xs text-sky-700">Mostrar "Hola, mundo"</div>
              <div className="mt-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">Fin</div>
            </div>
            <div className="flex flex-col justify-center rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-400">
              <p className="text-slate-500">// consola</p>
              <p>[10:00:01] ▶ Ejecutando…</p>
              <p className="text-slate-200">[10:00:02] Hola, mundo</p>
              <p className="text-emerald-400">[10:00:02] ✔ Finalizado</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-indigo-50 p-4 text-center">
              <Hand size={32} className="mb-2 text-indigo-600" />
              <p className="text-xs font-medium text-indigo-700">Controla el lienzo con gestos</p>
              <p className="mt-1 text-[11px] text-slate-500">✋ mover · 🤏 tomar · 👍 ejecutar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-10 text-center text-2xl font-bold text-slate-900">¿Cómo funciona?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Blocks, color: "indigo", title: "1. Arrastra bloques", text: "Construye programas uniendo bloques de control, datos, operadores y ciclos en un lienzo visual." },
            { icon: Camera, color: "teal", title: "2. Usa gestos o teclado", text: "Controla el lienzo con gestos de la mano frente a la cámara, o con el teclado si prefieres." },
            { icon: Play, color: "violet", title: "3. Ejecuta y aprende", text: "Pulsa ejecutar y observa el flujo paso a paso en la consola. Recibe retroalimentación de tu profesor." },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-${s.color}-100 text-${s.color}-600`}>
                <s.icon size={22} />
              </div>
              <h3 className="mb-1.5 text-base font-bold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-10 text-center text-2xl font-bold text-slate-900">Tres roles, una plataforma</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: GraduationCap, color: "indigo", title: "Estudiante", text: "Matricúlate en cursos, resuelve actividades con bloques y recibe retroalimentación." },
            { icon: UserCog, color: "teal", title: "Profesor", text: "Crea cursos y actividades, asígnalas a tus estudiantes y revisa sus entregas." },
            { icon: MousePointer, color: "violet", title: "Administrador", text: "Gestiona usuarios, roles y el catálogo completo de cursos de la plataforma." },
          ].map((r, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-${r.color}-100 text-${r.color}-600`}>
                <r.icon size={24} />
              </div>
              <h3 className="mb-1 text-base font-bold text-slate-900">{r.title}</h3>
              <p className="text-sm text-slate-600">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-teal-500 p-10 text-center text-white shadow-2xl">
          <h2 className="text-2xl font-bold">¿Listo para aprender programación de otra forma?</h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">Crea tu cuenta en segundos y empieza a construir tu primer programa con bloques.</p>
          <Link to="/registro" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50">
            Crear mi cuenta <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        HandProGaming · Plataforma educativa de lógica con bloques visuales
      </footer>
    </div>
  );
}