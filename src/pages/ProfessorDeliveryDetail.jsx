import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { toast } from "sonner";
import { ArrowLeft, Save, Star, MessageSquare } from "lucide-react";
import { BLOQUES, CATEGORIAS } from "@/lib/blocks";
import { secuenciaDesde } from "@/lib/program";

function BloqueSoloLectura({ bloque, programa }) {
  const def = BLOQUES[bloque.tipo];
  if (!def) return null;
  const Icon = def.icon;
  const cat = CATEGORIAS[def.categoria];
  const hijos = secuenciaDesde(programa.bloques, (bloque.hijosId || [])[0]);
  const els = def.tieneElse ? secuenciaDesde(programa.bloques, (bloque.hijoElseId || [])[0]) : [];
  return (
    <div className="rounded-lg border-l-4 bg-white px-3 py-2 shadow-sm" style={{ borderLeftColor: cat.hex }}>
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded text-white" style={{ background: cat.hex }}><Icon size={13} /></span>
        <span className="text-xs font-semibold text-slate-800">{def.nombre}</span>
      </div>
      {def.params.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-2 pl-8 text-[11px] text-slate-500">
          {def.params.map((p) => (
            <span key={p.key} className="font-mono"><span className="text-slate-400">{p.label}:</span> {String(bloque.parametros[p.key] || "—")}</span>
          ))}
        </div>
      )}
      {def.esContenedor && (
        <div className="ml-3 mt-1.5 space-y-1.5 border-l-2 border-dashed pl-3" style={{ borderLeftColor: cat.hex + "60" }}>
          {hijos.length === 0 ? <span className="text-[11px] text-slate-400">(cuerpo vacío)</span> :
            hijos.map((h) => <BloqueSoloLectura key={h.id} bloque={h} programa={programa} />)}
          {def.tieneElse && (
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400">Si no</p>
              {els.length === 0 ? <span className="text-[11px] text-slate-400">(vacío)</span> :
                els.map((h) => <BloqueSoloLectura key={h.id} bloque={h} programa={programa} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProfessorDeliveryDetail() {
  const { id } = useParams();
  const { db, user, crearRetro } = useApp();
  const navigate = useNavigate();
  const entrega = db.entregas.find((e) => e.id === id);
  const asig = entrega && db.asignaciones.find((a) => a.id === entrega.asignacionId);
  const act = asig && db.actividades.find((x) => x.id === asig.actividadId);
  const est = asig && db.users.find((u) => u.id === asig.estudianteId);
  const retroExistente = entrega && db.retro.find((r) => r.entregaId === entrega.id);
  const [comentario, setComentario] = useState(retroExistente?.comentario || "");
  const [cal, setCal] = useState(retroExistente?.calificacion || 0);

  if (!entrega) return <div className="py-10 text-center text-slate-500">Entrega no encontrada.</div>;

  const guardar = () => {
    if (!comentario.trim()) return toast.error("Escribe un comentario");
    crearRetro(entrega.id, user.id, comentario.trim(), cal || undefined);
    toast.success("Retroalimentación guardada");
    navigate("/profesor/entregas");
  };

  return (
    <div className="space-y-5">
      <Link to="/profesor/entregas" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Volver a entregas
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs text-slate-400">{act?.titulo}</p>
        <h1 className="text-xl font-bold text-slate-900">Entrega de {est?.nombre}</h1>
        <p className="text-xs text-slate-400">Entregada el {new Date(entrega.entregadaEn).toLocaleString()}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Programa */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">Programa entregado (solo lectura)</h2>
          {entrega.programa?.bloques?.length ? (
            <div className="space-y-1.5">
              {secuenciaDesde(entrega.programa.bloques, entrega.programa.bloques.find((b) => b.tipo === "inicio")?.siguienteId).map((b) => (
                <BloqueSoloLectura key={b.id} bloque={b} programa={entrega.programa} />
              ))}
            </div>
          ) : <p className="text-sm text-slate-400">Programa vacío.</p>}
        </div>

        {/* Salida + retro */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <p className="mb-2 text-xs font-semibold text-slate-300">Salida obtenida</p>
            {(entrega.salida || []).length === 0 ? <p className="font-mono text-xs text-slate-500">// sin salida</p> :
              (entrega.salida || []).map((l, i) => <p key={i} className="font-mono text-xs text-emerald-400">{l}</p>)}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><MessageSquare size={16} className="text-violet-600" /> Retroalimentación</h2>
            {retroExistente && (
              <div className="mb-3 rounded-lg bg-violet-50 p-3 text-xs text-slate-600">
                Ya dejaste retroalimentación. Puedes actualizarla abajo.
              </div>
            )}
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Comentario</label>
            <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
            <label className="mb-1.5 mt-3 block text-xs font-medium text-slate-600">Calificación (opcional)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setCal(n)} className="p-1">
                  <Star size={22} className={n <= cal ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                </button>
              ))}
              {cal > 0 && <button onClick={() => setCal(0)} className="ml-2 text-xs text-slate-400 hover:text-slate-600">quitar</button>}
            </div>
            <button onClick={guardar} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
              <Save size={16} /> Guardar retroalimentación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}