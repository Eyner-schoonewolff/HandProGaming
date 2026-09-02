import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MessageSquare, Lock } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { toast } from "sonner";
import BlockEditor from "@/components/BlockEditor";
import { programaVacio } from "@/lib/program";

export default function StudentActivityDetail() {
  const { id } = useParams();
  const { db, user, entregar } = useApp();
  const navigate = useNavigate();
  const asignacion = db.asignaciones.find((a) => a.id === id);
  const actividad = asignacion && db.actividades.find((x) => x.id === asignacion.actividadId);
  const curso = actividad && db.cursos.find((c) => c.id === actividad.cursoId);
  const entrega = db.entregas.find((e) => e.asignacionId === id);
  const retro = entrega && db.retro.find((r) => r.entregaId === entrega.id);

  const [programa, setPrograma] = useState(programaVacio());
  const [salida, setSalida] = useState([]);

  useEffect(() => {
    if (entrega) { setPrograma(entrega.programa); setSalida(entrega.salida || []); }
  }, [entrega]);

  if (!asignacion || !actividad) {
    return <div className="py-10 text-center text-slate-500">Actividad no encontrada.</div>;
  }

  const yaEntregada = asignacion.estado === "entregada" || asignacion.estado === "revisada";

  const handleEntregar = (prog) => {
    // Ejecutar para capturar salida
    import("@/lib/interpreter").then(async ({ ejecutarPrograma }) => {
      const out = [];
      try {
        await ejecutarPrograma(prog, { onOutput: (v) => out.push(String(v)) });
        entregar(asignacion.id, prog, out);
        toast.success("Actividad entregada correctamente");
        navigate("/estudiante/actividades");
      } catch (e) {
        // Entregar igual con la salida parcial
        entregar(asignacion.id, prog, out);
        toast.success("Actividad entregada (con advertencias en la salida)");
        navigate("/estudiante/actividades");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/estudiante/actividades" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={16} /> Volver a actividades
        </Link>
        {yaEntregada && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
            <Lock size={13} /> Modo lectura · ya entregada
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{actividad.titulo}</h1>
            <p className="text-xs text-slate-400">{curso?.nombre} · Dificultad: {actividad.dificultad}</p>
          </div>
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 capitalize">{actividad.dificultad}</span>
        </div>
      </div>

      {/* Retroalimentación si ya revisada */}
      {retro && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-5">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-violet-700"><MessageSquare size={16} /> Retroalimentación del profesor</h3>
          <p className="text-sm text-slate-700">"{retro.comentario}"</p>
          {retro.calificacion && <p className="mt-2 text-xs text-slate-500">Calificación: <strong className="text-violet-700">{retro.calificacion}/5</strong></p>}
        </div>
      )}

      {yaEntregada && (
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4">
          <p className="mb-2 text-xs font-semibold text-slate-300">Salida obtenida al entregar:</p>
          {salida.length === 0 ? <p className="font-mono text-xs text-slate-500">// sin salida</p> :
            salida.map((l, i) => <p key={i} className="font-mono text-xs text-emerald-400">{l}</p>)}
        </div>
      )}

      <BlockEditor
        programa={programa}
        setPrograma={setPrograma}
        bloquesPermitidos={actividad.bloquesPermitidos}
        enunciado={actividad.enunciado}
        titulo={actividad.titulo}
        onEntregar={yaEntregada ? undefined : handleEntregar}
      />
    </div>
  );
}