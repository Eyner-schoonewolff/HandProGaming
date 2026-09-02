import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { toast } from "sonner";
import BlockEditor from "@/components/BlockEditor";
import { programaVacio } from "@/lib/program";

export default function FreeEditor() {
  const { user, guardarProgramaLibre } = useApp();
  const [programa, setPrograma] = useState(programaVacio());

  const guardar = (prog) => {
    guardarProgramaLibre(prog);
    toast.success("Programa guardado en LocalStorage");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Editor libre</h1>
        <p className="text-sm text-slate-500">Practica construyendo programas con bloques sin una actividad asociada</p>
      </div>
      <BlockEditor programa={programa} setPrograma={setPrograma} titulo="Lienzo libre" onGuardar={guardar} />
    </div>
  );
}