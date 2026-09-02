import { BLOQUES, parametrosPorDefecto } from "@/lib/blocks";

/**
 * Modelo del programa
 * ------------------
 * Un programa es `{ id, bloques: Bloque[], actualizadoEn }`.
 * Cada bloque es `{ id, tipo, parametros, siguienteId, hijosId?, hijoElseId? }`.
 *
 * Las secuencias son listas enlazadas por `siguienteId`. Un contenedor guarda en
 * `hijosId[0]` (y en `hijoElseId[0]` si tiene "Si no") la cabeza de su cuerpo.
 */

let contador = 0;
function nuevoId(prefijo = "blk") {
  contador += 1;
  return `${prefijo}_${Date.now().toString(36)}_${contador.toString(36)}`;
}

export function programaVacio() {
  return { id: nuevoId("prog"), bloques: [], actualizadoEn: new Date().toISOString() };
}

export function crearBloque(tipo) {
  const def = BLOQUES[tipo];
  const bloque = {
    id: nuevoId(),
    tipo,
    parametros: parametrosPorDefecto(tipo),
    siguienteId: null,
  };
  if (def?.esContenedor) bloque.hijosId = [];
  if (def?.tieneElse) bloque.hijoElseId = [];
  return bloque;
}

/** Devuelve la lista de bloques encadenados desde `primerId` (sin incluir nulos). */
export function secuenciaDesde(bloques, primerId) {
  const porId = new Map(bloques.map((b) => [b.id, b]));
  const salida = [];
  const vistos = new Set();
  let actual = primerId;
  while (actual && porId.has(actual) && !vistos.has(actual)) {
    vistos.add(actual);
    const bloque = porId.get(actual);
    salida.push(bloque);
    actual = bloque.siguienteId;
  }
  return salida;
}

function conBloques(programa, bloques) {
  return { ...programa, bloques, actualizadoEn: new Date().toISOString() };
}

function buscar(bloques, id) {
  return bloques.find((b) => b.id === id) ?? null;
}

/** Cabeza de la secuencia indicada: "main" (tras Inicio), "hijos" o "else" de `parentId`. */
function cabezaDe(bloques, seqKey, parentId) {
  if (seqKey === "main") {
    const inicio = bloques.find((b) => b.tipo === "inicio");
    return inicio ? inicio.siguienteId : null;
  }
  const padre = buscar(bloques, parentId);
  if (!padre) return null;
  return (seqKey === "else" ? padre.hijoElseId : padre.hijosId)?.[0] ?? null;
}

function fijarCabeza(bloques, seqKey, parentId, nuevaCabezaId) {
  return bloques.map((b) => {
    if (seqKey === "main") {
      return b.tipo === "inicio" ? { ...b, siguienteId: nuevaCabezaId } : b;
    }
    if (b.id !== parentId) return b;
    const clave = seqKey === "else" ? "hijoElseId" : "hijosId";
    return { ...b, [clave]: nuevaCabezaId ? [nuevaCabezaId] : [] };
  });
}

/**
 * Agrega un bloque al final de la secuencia indicada.
 * En la secuencia principal, los bloques nuevos entran siempre antes de `fin`.
 */
export function agregarBloque(programa, tipo, seqKey = "main", parentId = null) {
  const def = BLOQUES[tipo];
  if (!def) return programa;
  if (def.unico && programa.bloques.some((b) => b.tipo === tipo)) return programa;

  const nuevo = crearBloque(tipo);
  let bloques = [...programa.bloques, nuevo];

  // "inicio" encabeza la cadena: engancha detrás lo que ya existiera suelto.
  if (tipo === "inicio") {
    const huerfanos = programa.bloques.filter(
      (b) => !programa.bloques.some((otro) => otro.siguienteId === b.id),
    );
    const primero = huerfanos.find((b) => b.tipo !== "fin") ?? huerfanos[0] ?? null;
    return conBloques(
      programa,
      bloques.map((b) => (b.id === nuevo.id ? { ...b, siguienteId: primero?.id ?? null } : b)),
    );
  }

  const cabeza = cabezaDe(bloques, seqKey, parentId);
  const secuencia = secuenciaDesde(bloques, cabeza);

  // En la secuencia principal el bloque "fin" siempre queda de último.
  const fin = seqKey === "main" ? secuencia.find((b) => b.tipo === "fin") : null;
  if (fin && tipo !== "fin") {
    const anterior = secuencia[secuencia.indexOf(fin) - 1] ?? null;
    bloques = bloques.map((b) => {
      if (b.id === nuevo.id) return { ...b, siguienteId: fin.id };
      if (anterior && b.id === anterior.id) return { ...b, siguienteId: nuevo.id };
      return b;
    });
    if (!anterior) bloques = fijarCabeza(bloques, seqKey, parentId, nuevo.id);
    return conBloques(programa, bloques);
  }

  const ultimo = secuencia[secuencia.length - 1] ?? null;
  if (!ultimo) {
    return conBloques(programa, fijarCabeza(bloques, seqKey, parentId, nuevo.id));
  }
  return conBloques(
    programa,
    bloques.map((b) => (b.id === ultimo.id ? { ...b, siguienteId: nuevo.id } : b)),
  );
}

/** Elimina un bloque (y su cuerpo, si es contenedor) recosiendo la cadena. */
export function eliminarBloque(programa, id) {
  const objetivo = buscar(programa.bloques, id);
  if (!objetivo) return programa;

  const descendientes = new Set([id]);
  const pendientes = [
    ...secuenciaDesde(programa.bloques, objetivo.hijosId?.[0]),
    ...secuenciaDesde(programa.bloques, objetivo.hijoElseId?.[0]),
  ];
  while (pendientes.length) {
    const bloque = pendientes.pop();
    if (descendientes.has(bloque.id)) continue;
    descendientes.add(bloque.id);
    pendientes.push(
      ...secuenciaDesde(programa.bloques, bloque.hijosId?.[0]),
      ...secuenciaDesde(programa.bloques, bloque.hijoElseId?.[0]),
    );
  }

  const bloques = programa.bloques
    .filter((b) => !descendientes.has(b.id))
    .map((b) => ({
      ...b,
      siguienteId: b.siguienteId === id ? objetivo.siguienteId : b.siguienteId,
      ...(b.hijosId
        ? { hijosId: b.hijosId[0] === id ? (objetivo.siguienteId ? [objetivo.siguienteId] : []) : b.hijosId }
        : {}),
      ...(b.hijoElseId
        ? { hijoElseId: b.hijoElseId[0] === id ? (objetivo.siguienteId ? [objetivo.siguienteId] : []) : b.hijoElseId }
        : {}),
    }));

  return conBloques(programa, bloques);
}

/** Localiza la secuencia (main / hijos / else) a la que pertenece un bloque. */
function ubicar(bloques, id) {
  const inicio = bloques.find((b) => b.tipo === "inicio");
  if (inicio && secuenciaDesde(bloques, inicio.siguienteId).some((b) => b.id === id)) {
    return { seqKey: "main", parentId: null };
  }
  for (const bloque of bloques) {
    if (bloque.hijosId?.[0] && secuenciaDesde(bloques, bloque.hijosId[0]).some((b) => b.id === id)) {
      return { seqKey: "hijos", parentId: bloque.id };
    }
    if (bloque.hijoElseId?.[0] && secuenciaDesde(bloques, bloque.hijoElseId[0]).some((b) => b.id === id)) {
      return { seqKey: "else", parentId: bloque.id };
    }
  }
  return null;
}

/** Mueve un bloque una posición arriba (-1) o abajo (+1) dentro de su secuencia. */
export function moverBloque(programa, id, direccion) {
  const bloque = buscar(programa.bloques, id);
  if (!bloque || bloque.tipo === "inicio" || bloque.tipo === "fin") return programa;

  const ubicacion = ubicar(programa.bloques, id);
  if (!ubicacion) return programa;

  const cabeza = cabezaDe(programa.bloques, ubicacion.seqKey, ubicacion.parentId);
  const secuencia = secuenciaDesde(programa.bloques, cabeza);
  const movibles = secuencia.filter((b) => b.tipo !== "fin");
  const indice = movibles.findIndex((b) => b.id === id);
  const destino = indice + direccion;
  if (indice === -1 || destino < 0 || destino >= movibles.length) return programa;

  const orden = movibles.map((b) => b.id);
  [orden[indice], orden[destino]] = [orden[destino], orden[indice]];

  const fin = secuencia.find((b) => b.tipo === "fin");
  const ordenFinal = fin ? [...orden, fin.id] : orden;

  let bloques = programa.bloques.map((b) => {
    const posicion = ordenFinal.indexOf(b.id);
    if (posicion === -1) return b;
    return { ...b, siguienteId: ordenFinal[posicion + 1] ?? null };
  });
  bloques = fijarCabeza(bloques, ubicacion.seqKey, ubicacion.parentId, ordenFinal[0] ?? null);

  return conBloques(programa, bloques);
}

/** Cambia un parámetro editable de un bloque. */
export function actualizarParametro(programa, id, clave, valor) {
  return conBloques(
    programa,
    programa.bloques.map((b) =>
      b.id === id ? { ...b, parametros: { ...b.parametros, [clave]: valor } } : b,
    ),
  );
}
