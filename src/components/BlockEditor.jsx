import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Play, Square, Trash2, ChevronUp, ChevronDown, Plus, X, Keyboard,
  Camera, CameraOff, Hand, ArrowDown, Check, AlertTriangle, Loader2,
  Eraser, Save
} from "lucide-react";
import { BLOQUES, CATEGORIAS } from "@/lib/blocks";
import { secuenciaDesde, agregarBloque, eliminarBloque, moverBloque, actualizarParametro } from "@/lib/program";
import { ejecutarPrograma, validarPrograma } from "@/lib/interpreter";
import { useApp } from "@/lib/AppContext";
import { useHandGestures } from "@/hooks/useHandGestures";

const GESTOS = [
  { id: "abierta", emoji: "✋", nombre: "Mano abierta", accion: "Mover cursor arriba", tecla: "↑" },
  { id: "indice", emoji: "☝️", nombre: "Índice arriba", accion: "Mover cursor abajo", tecla: "↓" },
  { id: "pinza", emoji: "🤏", nombre: "Pinza", accion: "Seleccionar bloque", tecla: "Enter" },
  { id: "dos", emoji: "✌️", nombre: "Dos dedos", accion: "Eliminar bloque", tecla: "Supr" },
  { id: "pulgar", emoji: "👍", nombre: "Pulgar arriba", accion: "Ejecutar programa", tecla: "Ctrl+Enter" },
  { id: "punio", emoji: "✊", nombre: "Puño cerrado", accion: "Cancelar / soltar", tecla: "Esc" },
];

function BloqueCard({ bloque, level, seqKey, parentId, programa, setPrograma, seleccionado, setSeleccionado, activo, foco, setFoco, onAddAfter }) {
  const def = BLOQUES[bloque.tipo];
  if (!def) return null;
  const Icon = def.icon;
  const cat = CATEGORIAS[def.categoria];
  const esCont = def.esContenedor;
  const hijos = secuenciaDesde(programa.bloques, (bloque.hijosId || [])[0]);
  const els = def.tieneElse ? secuenciaDesde(programa.bloques, (bloque.hijoElseId || [])[0]) : [];

  return (
    <div className={`rounded-xl transition ${activo ? "ring-2 ring-amber-400 ring-offset-1" : ""}`}>
      <div
        onClick={() => { setSeleccionado(bloque.id); setFoco(bloque.id); }}
        className={`group relative cursor-pointer border-l-4 rounded-xl px-3 py-2.5 shadow-sm transition hover:shadow-md ${
          seleccionado === bloque.id ? "ring-2 ring-indigo-500" : ""
        } ${foco === bloque.id ? "ring-2 ring-teal-500 ring-offset-2" : ""}`}
        style={{ borderLeftColor: cat.hex, background: "#fff" }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ background: cat.hex }}>
            <Icon size={15} />
          </span>
          <span className="text-sm font-semibold text-slate-800">{def.nombre}</span>
          {foco === bloque.id && (
            <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-teal-100 px-1 py-0.5 text-[9px] font-bold text-teal-700">
              <Hand size={9} /> cursor
            </span>
          )}
          <span className="ml-auto flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setPrograma(moverBloque(programa, bloque.id, -1)); }}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="Subir"
            ><ChevronUp size={15} /></button>
            <button
              onClick={(e) => { e.stopPropagation(); setPrograma(moverBloque(programa, bloque.id, 1)); }}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="Bajar"
            ><ChevronDown size={15} /></button>
            <button
              onClick={(e) => { e.stopPropagation(); setPrograma(eliminarBloque(programa, bloque.id)); if (seleccionado === bloque.id) setSeleccionado(null); }}
              className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              title="Eliminar"
            ><Trash2 size={15} /></button>
          </span>
        </div>
        {/* Parámetros */}
        {def.params.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2 pl-9">
            {def.params.map((p) => (
              <div key={p.key} className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-400">{p.label}:</span>
                {p.tipo === "select" ? (
                  <select
                    value={bloque.parametros[p.key] || ""}
                    onChange={(e) => { e.stopPropagation(); setPrograma(actualizarParametro(programa, bloque.id, p.key, e.target.value)); }}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-700 focus:border-indigo-400 focus:outline-none"
                  >
                    {p.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    value={bloque.parametros[p.key] || ""}
                    onChange={(e) => { e.stopPropagation(); setPrograma(actualizarParametro(programa, bloque.id, p.key, e.target.value)); }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={p.placeholder}
                    className="w-24 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-700 focus:border-indigo-400 focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cuerpo del contenedor */}
      {esCont && (
        <div className="ml-4 mt-1.5 border-l-2 border-dashed pl-3" style={{ borderLeftColor: cat.hex + "80" }}>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cuerpo (Si)</p>
          {hijos.length === 0 ? (
            <button
              onClick={() => setPrograma(agregarBloque(programa, "salida", "hijos", bloque.id))}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 py-2 text-xs text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
            >
              <Plus size={13} /> Agregar bloque al cuerpo
            </button>
          ) : (
            <div className="space-y-1.5">
              {hijos.map((h) => (
                <BloqueCard key={h.id} bloque={h} level={level + 1} seqKey="hijos" parentId={bloque.id}
                  programa={programa} setPrograma={setPrograma} seleccionado={seleccionado} setSeleccionado={setSeleccionado}
                  activo={activo} foco={foco} setFoco={setFoco} />
              ))}
            </div>
          )}
          {def.tieneElse && (
            <div className="mt-2">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cuerpo (Si no)</p>
              {els.length === 0 ? (
                <button
                  onClick={() => setPrograma(agregarBloque(programa, "salida", "else", bloque.id))}
                  className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 py-2 text-xs text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
                >
                  <Plus size={13} /> Agregar bloque al "Si no"
                </button>
              ) : (
                <div className="space-y-1.5">
                  {els.map((h) => (
                    <BloqueCard key={h.id} bloque={h} level={level + 1} seqKey="else" parentId={bloque.id}
                      programa={programa} setPrograma={setPrograma} seleccionado={seleccionado} setSeleccionado={setSeleccionado}
                      activo={activo} foco={foco} setFoco={setFoco} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BlockEditor({ programa, setPrograma, bloquesPermitidos, enunciado, onEntregar, onGuardar, titulo = "Editor de bloques" }) {
  const { user } = useApp();
  const [seleccionado, setSeleccionado] = useState(null);
  const [foco, setFoco] = useState(null);
  const [consola, setConsola] = useState([]);
  const [corriendo, setCorriendo] = useState(false);
  const [bloqueActivo, setBloqueActivo] = useState(null);
  const [inputDialog, setInputDialog] = useState(null); // {prompt, resolve}
  const [categoriaAbierta, setCategoriaAbierta] = useState("control");
  const [camaraOn, setCamaraOn] = useState(false);
  const [gestoActivo, setGestoActivo] = useState(null);
  const [gestoProgreso, setGestoProgreso] = useState(0);
  const [modoControl, setModoControl] = useState("teclado"); // teclado | gestos
  const [zona, setZona] = useState("lienzo"); // paleta | lienzo | consola
  const consolaRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [camStatus, setCamStatus] = useState({ state: "off" });

  // Refs para leer el estado actual dentro de los intervalos de gestos sin reiniciarlos.
  const programaRef = useRef(programa); programaRef.current = programa;
  const focoRef = useRef(foco); focoRef.current = foco;
  const seleccionadoRef = useRef(seleccionado); seleccionadoRef.current = seleccionado;
  const gestoConsumidoRef = useRef(false);

  const permitidos = bloquesPermitidos || Object.keys(BLOQUES);
  const validacion = validarPrograma(programa);

  // Reconocimiento real de gestos con la cámara (MediaPipe Hands, en el navegador).
  useHandGestures({
    enabled: camaraOn,
    videoRef,
    canvasRef,
    onGesture: (id) => setGestoActivo(id),
    onStatus: setCamStatus,
  });

  // Categorías que tienen al menos un bloque permitido
  const catsConBloques = Object.entries(CATEGORIAS).filter(([catKey]) =>
    Object.values(BLOQUES).some((b) => b.categoria === catKey && permitidos.includes(b.tipo))
  );

  const appendConsola = useCallback((line, tipo = "out") => {
    const hora = new Date().toLocaleTimeString("es-ES", { hour12: false });
    setConsola((c) => [...c, { line, tipo, hora }]);
  }, []);

  useEffect(() => {
    if (consolaRef.current) consolaRef.current.scrollTop = consolaRef.current.scrollHeight;
  }, [consola]);

  const ejecutar = async () => {
    if (!validacion.ok || corriendo) return;
    setConsola([]);
    setCorriendo(true);
    appendConsola("▶ Ejecutando programa…", "info");
    await ejecutarPrograma(programa, {
      onStep: async (id) => {
        setBloqueActivo(id);
        await new Promise((r) => setTimeout(r, 350));
      },
      onOutput: (val) => appendConsola(val, "out"),
      onInput: (prompt) => new Promise((resolve) => setInputDialog({ prompt, resolve })),
      onError: (msg) => appendConsola("✖ " + msg, "error"),
      onDone: () => appendConsola("✔ Ejecución finalizada.", "ok"),
    });
    setBloqueActivo(null);
    setCorriendo(false);
  };

  const detener = () => { setCorriendo(false); setBloqueActivo(null); appendConsola("⏹ Detenido por el usuario.", "info"); };

  // Lista ordenada de bloques navegables (secuencia principal) para el cursor por gestos.
  const ordenIds = (() => {
    const ini = programa.bloques.find((b) => b.tipo === "inicio");
    const seq = secuenciaDesde(programa.bloques, ini ? ini.siguienteId : null);
    return [ini?.id, ...seq.map((b) => b.id)].filter(Boolean);
  })();
  const ordenIdsRef = useRef(ordenIds); ordenIdsRef.current = ordenIds;

  const moverCursor = useCallback((dir) => {
    const ids = ordenIdsRef.current;
    if (!ids.length) return;
    const idx = ids.indexOf(focoRef.current);
    const newIdx = idx === -1
      ? (dir === 1 ? 0 : ids.length - 1)
      : Math.min(Math.max(idx + dir, 0), ids.length - 1);
    setFoco(ids[newIdx]);
  }, []);

  // Motor de gestos: continuos (mover cursor) repiten mientras se sostienen;
  // discretos se confirman con una barra y se disparan una vez.
  useEffect(() => {
    if (!gestoActivo) { setGestoProgreso(0); gestoConsumidoRef.current = false; return; }
    if (gestoActivo === "abierta" || gestoActivo === "indice") {
      setGestoProgreso(100);
      const dir = gestoActivo === "indice" ? 1 : -1;
      moverCursor(dir);
      const t = setInterval(() => moverCursor(dir), 450);
      return () => clearInterval(t);
    }
    setGestoProgreso(0);
    let p = 0;
    const t = setInterval(() => {
      p += 10;
      setGestoProgreso(p);
      if (p >= 100) {
        clearInterval(t);
        if (!gestoConsumidoRef.current) {
          gestoConsumidoRef.current = true;
          dispararGesto(gestoActivo);
        }
      }
    }, 40);
    return () => clearInterval(t);
  }, [gestoActivo, moverCursor]);

  const dispararGesto = (id) => {
    if (id === "pulgar") { ejecutar(); }
    else if (id === "punio") { setSeleccionado(null); appendConsola("Acción cancelada (gesto).", "info"); }
    else if (id === "dos") {
      const objetivo = seleccionadoRef.current || focoRef.current;
      if (objetivo) {
        setPrograma(eliminarBloque(programaRef.current, objetivo));
        setSeleccionado(null);
        setFoco(null);
        appendConsola("Bloque eliminado (gesto).", "info");
      } else {
        appendConsola("Nada que eliminar: mueve el cursor a un bloque primero.", "info");
      }
    } else if (id === "pinza") {
      const f = focoRef.current;
      if (f) {
        setSeleccionado((s) => (s === f ? null : f));
        appendConsola("Bloque seleccionado (gesto).", "info");
      } else {
        appendConsola("Mueve el cursor a un bloque y luego pellizca.", "info");
      }
    }
  };

  // Modo teclado
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target?.tagName;
      const escribiendo = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (escribiendo && !["Escape"].includes(e.key)) return;
      // Ctrl/Cmd+Enter ejecutar
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); ejecutar(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); onGuardar?.(programa); return; }
      if (e.key === "?" ) { /* abrir tutorial: dejamos al layout */ return; }
      if (e.key === "Escape") { setSeleccionado(null); if (inputDialog) { inputDialog.resolve(""); setInputDialog(null); } return; }
      if (corriendo) return;
      if (e.key === "Tab") { e.preventDefault(); setZona((z) => z === "paleta" ? "lienzo" : z === "lienzo" ? "consola" : "paleta"); return; }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (seleccionado) { e.preventDefault(); setPrograma(eliminarBloque(programa, seleccionado)); setSeleccionado(null); }
        return;
      }
      if (e.key === "Enter" && foco) { setSeleccionado(foco); return; }
      if (zona === "lienzo" && foco) {
        if (e.key === "ArrowUp") { setPrograma(moverBloque(programa, foco, -1)); }
        if (e.key === "ArrowDown") { setPrograma(moverBloque(programa, foco, 1)); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [programa, foco, seleccionado, zona, corriendo, inputDialog]);

  const inicio = programa.bloques.find((b) => b.tipo === "inicio");
  const mainSeq = secuenciaDesde(programa.bloques, inicio ? inicio.siguienteId : null);

  const agregarAMain = (tipo) => {
    setPrograma(agregarBloque(programa, tipo, "main", null));
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-3 lg:flex-row">
      {/* PALETA */}
      <div className={`flex w-full shrink-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm lg:w-64 ${zona === "paleta" ? "ring-2 ring-teal-400" : ""}`}>
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-800">Paleta de bloques</h3>
          <p className="text-[11px] text-slate-400">Clic en un bloque para agregarlo</p>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {catsConBloques.map(([catKey, cat]) => {
            const bloquesCat = Object.values(BLOQUES).filter((b) => b.categoria === catKey && permitidos.includes(b.tipo));
            if (!bloquesCat.length) return null;
            const abierta = categoriaAbierta === catKey;
            return (
              <div key={catKey} className="rounded-xl border border-slate-100">
                <button
                  onClick={() => setCategoriaAbierta(abierta ? null : catKey)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left"
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: cat.hex }} />
                  <span className="text-xs font-semibold text-slate-700">{cat.nombre}</span>
                  <ChevronDown size={14} className={`ml-auto text-slate-400 transition ${abierta ? "rotate-180" : ""}`} />
                </button>
                {abierta && (
                  <div className="space-y-1.5 px-2 pb-2">
                    {bloquesCat.map((b) => {
                      const Icon = b.icon;
                      return (
                        <button
                          key={b.tipo}
                          onClick={() => agregarAMain(b.tipo)}
                          disabled={b.unico && programa.bloques.some((x) => x.tipo === b.tipo)}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                          style={{ borderLeft: `3px solid ${cat.hex}`, background: cat.hex + "12" }}
                          title={b.unico && programa.bloques.some((x) => x.tipo === b.tipo) ? "Ya existe un bloque de este tipo" : b.descripcion}
                        >
                          <Icon size={14} style={{ color: cat.hex }} />
                          {b.nombre}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* LIENZO */}
      <div className={`flex min-w-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-slate-50 shadow-sm ${zona === "lienzo" ? "ring-2 ring-teal-400" : ""}`}>
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2.5">
          <h3 className="text-sm font-bold text-slate-800">{titulo}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={ejecutar}
              disabled={!validacion.ok || corriendo}
              title={validacion.ok ? "Ejecutar (Ctrl+Enter)" : validacion.faltan.join(" · ")}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {corriendo ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {corriendo ? "Ejecutando…" : "Ejecutar"}
            </button>
            {corriendo && (
              <button onClick={detener} className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600">
                <Square size={13} /> Detener
              </button>
            )}
            <button onClick={() => setConsola([])} title="Limpiar consola" className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100">
              <Eraser size={14} />
            </button>
            {onGuardar && (
              <button onClick={() => onGuardar(programa)} title="Guardar (Ctrl+S)" className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100">
                <Save size={14} />
              </button>
            )}
            {onEntregar && (
              <button
                onClick={() => onEntregar(programa)}
                disabled={!validacion.ok}
                title={validacion.ok ? "Entregar actividad" : validacion.faltan.join(" · ")}
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:bg-slate-300"
              >
                <Check size={14} /> Entregar
              </button>
            )}
          </div>
        </div>

        {/* Aviso de validación */}
        {!validacion.ok && (
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 text-xs text-amber-700">
            <AlertTriangle size={14} />
            {validacion.faltan.join(" · ")}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4" onClick={() => setFoco(null)}>
          {programa.bloques.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
              <Hand size={40} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">Arrastra o agrega el bloque <span className="font-bold text-emerald-600">Inicio</span> para comenzar</p>
              <p className="text-xs">Toca un bloque de la paleta para añadirlo al lienzo</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {inicio ? (
                <BloqueCard bloque={inicio} level={0} programa={programa} setPrograma={setPrograma}
                  seleccionado={seleccionado} setSeleccionado={setSeleccionado} activo={bloqueActivo === inicio.id}
                  foco={foco} setFoco={setFoco} />
              ) : (
                <button onClick={() => agregarAMain("inicio")} className="flex w-full items-center justify-center gap-1 rounded-xl border-2 border-dashed border-emerald-300 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50">
                  <Plus size={16} /> Agregar bloque Inicio
                </button>
              )}
              {mainSeq.filter((b) => b.tipo !== "fin").map((b) => (
                <BloqueCard key={b.id} bloque={b} level={0} programa={programa} setPrograma={setPrograma}
                  seleccionado={seleccionado} setSeleccionado={setSeleccionado} activo={bloqueActivo === b.id}
                  foco={foco} setFoco={setFoco} />
              ))}
              {/* Botón agregar entre secuencia y fin */}
              {inicio && (
                <button onClick={() => agregarAMain("salida")} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 py-1.5 text-xs text-slate-400 hover:border-indigo-300 hover:text-indigo-500">
                  <Plus size={12} /> Agregar bloque aquí
                </button>
              )}
              {programa.bloques.find((b) => b.tipo === "fin") ? (
                <BloqueCard bloque={programa.bloques.find((b) => b.tipo === "fin")} level={0} programa={programa} setPrograma={setPrograma}
                  seleccionado={seleccionado} setSeleccionado={setSeleccionado} activo={bloqueActivo === programa.bloques.find((b) => b.tipo === "fin").id}
                  foco={foco} setFoco={setFoco} />
              ) : (
                <button onClick={() => agregarAMain("fin")} className="flex w-full items-center justify-center gap-1 rounded-xl border-2 border-dashed border-emerald-300 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50">
                  <Plus size={15} /> Agregar bloque Fin
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="flex w-full shrink-0 flex-col gap-3 lg:w-80">
        {/* Panel de cámara / gestos */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {camaraOn ? <Camera size={15} className="text-indigo-600" /> : <CameraOff size={15} className="text-slate-400" />}
              <span className="text-xs font-semibold text-slate-700">Control por gestos</span>
            </div>
            <button
              onClick={() => {
                setCamaraOn((v) => !v);
                setModoControl(!camaraOn ? "gestos" : "teclado");
                setCamStatus({ state: !camaraOn ? "loading" : "off" });
              }}
              className={`relative h-5 w-9 rounded-full transition ${camaraOn ? "bg-indigo-600" : "bg-slate-300"}`}
              aria-label="Activar cámara"
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${camaraOn ? "left-4" : "left-0.5"}`} />
            </button>
          </div>
          <div className="relative mb-2 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-slate-900">
            {camaraOn ? (
              <>
                <video ref={videoRef} className="h-full w-full object-cover" style={{ transform: "scaleX(-1)" }} playsInline muted />
                <canvas ref={canvasRef} width={320} height={240} className="absolute inset-0 h-full w-full" style={{ transform: "scaleX(-1)" }} />
                {camStatus.state === "loading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 text-center text-white">
                    <div>
                      <Loader2 size={20} className="mx-auto mb-1 animate-spin" />
                      <p className="text-[11px]">Cargando detector…</p>
                    </div>
                  </div>
                )}
                {camStatus.state === "error" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-rose-900/70 px-2 text-center text-white">
                    <div>
                      <CameraOff size={20} className="mx-auto mb-1" />
                      <p className="text-[11px]">{camStatus.message || "No se pudo acceder a la cámara"}</p>
                    </div>
                  </div>
                )}
                {camStatus.state === "ready" && (
                  <div className="absolute bottom-0 left-0 right-0">
                    {gestoActivo && (
                      <div className="h-1 w-full bg-slate-700/50">
                        <div className="h-full bg-teal-400 transition-all" style={{ width: `${gestoProgreso}%` }} />
                      </div>
                    )}
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] text-white">
                        {gestoActivo ? GESTOS.find((g) => g.id === gestoActivo)?.nombre : "Muestra tu mano"}
                      </span>
                      {gestoActivo && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-slate-400">
                <CameraOff size={24} className="mx-auto mb-1" />
                <p className="text-[11px]">Cámara apagada · modo teclado</p>
              </div>
            )}
          </div>
          {camaraOn && (
            <div className="grid grid-cols-3 gap-1.5">
              {GESTOS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGestoActivo(g.id)}
                  className={`flex flex-col items-center rounded-lg border py-1.5 text-[10px] transition ${
                    gestoActivo === g.id ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:bg-slate-50"
                  }`}
                  title={`${g.nombre}: ${g.accion}`}
                >
                  <span className="text-base">{g.emoji}</span>
                  <span className="text-slate-500">{g.nombre.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          )}
          <p className="mt-2 text-[10px] text-slate-400">
            Mano abierta / índice: mueven el cursor (mantén el gesto para seguir moviéndote). Pinza: selecciona. Dos dedos: elimina. Pulgar: ejecuta. Puño: cancela. El vídeo no se envía a ningún servidor.
          </p>
        </div>

        {/* Enunciado (si actividad) */}
        {enunciado && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-500">Enunciado</p>
            <p className="text-xs leading-relaxed text-slate-700">{enunciado}</p>
          </div>
        )}

        {/* Consola */}
        <div className={`flex min-h-[160px] flex-1 flex-col rounded-2xl border border-slate-200 bg-slate-900 shadow-sm ${zona === "consola" ? "ring-2 ring-teal-400" : ""}`}>
          <div className="flex items-center gap-1.5 border-b border-slate-700 px-3 py-2">
            <Terminal />
            <span className="text-xs font-semibold text-slate-200">Consola de salida</span>
          </div>
          <div ref={consolaRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs">
            {consola.length === 0 ? (
              <p className="text-slate-500">// La salida del programa aparecerá aquí…</p>
            ) : (
              consola.map((l, i) => (
                <div key={i} className={
                  l.tipo === "error" ? "text-rose-400" :
                  l.tipo === "ok" ? "text-emerald-400" :
                  l.tipo === "info" ? "text-sky-400" : "text-slate-200"
                }>
                  <span className="text-slate-600">[{l.hora}] </span>{l.line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Diálogo de entrada */}
      {inputDialog && (
        <InputDialog dialog={inputDialog} onClose={(v) => { inputDialog.resolve(v); setInputDialog(null); }} />
      )}
    </div>
  );
}

function Terminal() {
  return <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />;
}

function InputDialog({ dialog, onClose }) {
  const [val, setVal] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="mb-3 text-sm font-bold text-slate-800">Entrada de datos</h3>
        <p className="mb-3 text-sm text-slate-600">{dialog.prompt}</p>
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onClose(val); }}
          className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm focus:border-indigo-400 focus:outline-none"
        />
        <div className="flex justify-end gap-2">
          <button onClick={() => onClose("")} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">Cancelar</button>
          <button onClick={() => onClose(val)} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">Aceptar</button>
        </div>
      </div>
    </div>
  );
}