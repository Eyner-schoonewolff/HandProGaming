import { secuenciaDesde } from "@/lib/program";

export const LIMITE_PASOS = 10000;

export class ErrorPrograma extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorPrograma";
  }
}

/* ------------------------------------------------------------------ *
 * Evaluador de expresiones (sin eval): números, textos entre comillas,
 * variables, + - * / %, comparaciones y los conectores y / o / no.
 * ------------------------------------------------------------------ */

function tokenizar(entrada) {
  const tokens = [];
  let i = 0;
  while (i < entrada.length) {
    const c = entrada[i];
    if (/\s/.test(c)) { i += 1; continue; }

    if (c === '"' || c === "'") {
      const cierre = c;
      let texto = "";
      i += 1;
      while (i < entrada.length && entrada[i] !== cierre) { texto += entrada[i]; i += 1; }
      if (i >= entrada.length) throw new ErrorPrograma("Falta cerrar las comillas de un texto");
      i += 1;
      tokens.push({ tipo: "texto", valor: texto });
      continue;
    }

    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(entrada[i + 1] ?? ""))) {
      let numero = "";
      while (i < entrada.length && /[0-9.]/.test(entrada[i])) { numero += entrada[i]; i += 1; }
      tokens.push({ tipo: "numero", valor: Number(numero) });
      continue;
    }

    if (/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ_]/.test(c)) {
      let nombre = "";
      while (i < entrada.length && /[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ_]/.test(entrada[i])) {
        nombre += entrada[i];
        i += 1;
      }
      const minuscula = nombre.toLowerCase();
      if (["y", "o", "no", "verdadero", "falso"].includes(minuscula)) {
        tokens.push({ tipo: "palabra", valor: minuscula });
      } else {
        tokens.push({ tipo: "identificador", valor: nombre });
      }
      continue;
    }

    const par = entrada.slice(i, i + 2);
    if (["==", "!=", ">=", "<=", "&&", "||"].includes(par)) {
      tokens.push({ tipo: "operador", valor: par });
      i += 2;
      continue;
    }
    if ("+-*/%<>()=!".includes(c)) {
      tokens.push({ tipo: "operador", valor: c === "=" ? "==" : c });
      i += 1;
      continue;
    }
    throw new ErrorPrograma(`No entiendo el símbolo "${c}" dentro de la expresión`);
  }
  return tokens;
}

function aNumero(valor) {
  if (typeof valor === "number") return valor;
  if (typeof valor === "boolean") return valor ? 1 : 0;
  const numero = Number(String(valor).trim());
  if (Number.isNaN(numero)) throw new ErrorPrograma(`"${valor}" no es un número`);
  return numero;
}

export function esVerdadero(valor) {
  if (typeof valor === "boolean") return valor;
  if (typeof valor === "number") return valor !== 0;
  return String(valor ?? "").trim().length > 0;
}

export function formatearValor(valor) {
  if (typeof valor === "boolean") return valor ? "verdadero" : "falso";
  if (typeof valor === "number") {
    return Number.isInteger(valor) ? String(valor) : String(Number(valor.toFixed(6)));
  }
  return String(valor);
}

function analizar(tokens, variables) {
  let pos = 0;
  const ver = () => tokens[pos];
  const coincide = (valor) => {
    const token = ver();
    if (token && (token.tipo === "operador" || token.tipo === "palabra") && token.valor === valor) {
      pos += 1;
      return true;
    }
    return false;
  };

  function primario() {
    const token = ver();
    if (!token) throw new ErrorPrograma("La expresión está incompleta");
    if (coincide("(")) {
      const valor = oLogico();
      if (!coincide(")")) throw new ErrorPrograma("Falta cerrar un paréntesis");
      return valor;
    }
    if (coincide("-")) return -aNumero(primario());
    if (coincide("no") || coincide("!")) return !esVerdadero(primario());
    pos += 1;
    if (token.tipo === "numero" || token.tipo === "texto") return token.valor;
    if (token.tipo === "palabra") {
      if (token.valor === "verdadero") return true;
      if (token.valor === "falso") return false;
    }
    if (token.tipo === "identificador") {
      if (!(token.valor in variables)) {
        throw new ErrorPrograma(`La variable "${token.valor}" no existe todavía`);
      }
      return variables[token.valor];
    }
    throw new ErrorPrograma("No pude interpretar la expresión");
  }

  function multiplicativo() {
    let izquierda = primario();
    for (;;) {
      if (coincide("*")) izquierda = aNumero(izquierda) * aNumero(primario());
      else if (coincide("/")) {
        const derecha = aNumero(primario());
        if (derecha === 0) throw new ErrorPrograma("No se puede dividir entre cero");
        izquierda = aNumero(izquierda) / derecha;
      } else if (coincide("%")) {
        const derecha = aNumero(primario());
        if (derecha === 0) throw new ErrorPrograma("No se puede dividir entre cero");
        izquierda = aNumero(izquierda) % derecha;
      } else return izquierda;
    }
  }

  function aditivo() {
    let izquierda = multiplicativo();
    for (;;) {
      if (coincide("+")) {
        const derecha = multiplicativo();
        izquierda =
          typeof izquierda === "string" || typeof derecha === "string"
            ? `${formatearValor(izquierda)}${formatearValor(derecha)}`
            : aNumero(izquierda) + aNumero(derecha);
      } else if (coincide("-")) izquierda = aNumero(izquierda) - aNumero(multiplicativo());
      else return izquierda;
    }
  }

  function igual(a, b) {
    if (typeof a === "number" || typeof b === "number") return aNumero(a) === aNumero(b);
    return a === b;
  }

  function comparativo() {
    let izquierda = aditivo();
    for (;;) {
      if (coincide(">=")) izquierda = aNumero(izquierda) >= aNumero(aditivo());
      else if (coincide("<=")) izquierda = aNumero(izquierda) <= aNumero(aditivo());
      else if (coincide(">")) izquierda = aNumero(izquierda) > aNumero(aditivo());
      else if (coincide("<")) izquierda = aNumero(izquierda) < aNumero(aditivo());
      else if (coincide("==")) izquierda = igual(izquierda, aditivo());
      else if (coincide("!=")) izquierda = !igual(izquierda, aditivo());
      else return izquierda;
    }
  }

  function yLogico() {
    let izquierda = comparativo();
    while (coincide("y") || coincide("&&")) {
      izquierda = esVerdadero(izquierda) && esVerdadero(comparativo());
    }
    return izquierda;
  }

  function oLogico() {
    let izquierda = yLogico();
    while (coincide("o") || coincide("||")) {
      izquierda = esVerdadero(izquierda) || esVerdadero(yLogico());
    }
    return izquierda;
  }

  const resultado = oLogico();
  if (pos < tokens.length) throw new ErrorPrograma("Sobra contenido al final de la expresión");
  return resultado;
}

export function evaluarExpresion(expresion, variables = {}) {
  const texto = String(expresion ?? "").trim();
  if (!texto) throw new ErrorPrograma("Hay una expresión vacía en un bloque");
  return analizar(tokenizar(texto), variables);
}

/* ------------------------------------------------------------------ *
 * Validación
 * ------------------------------------------------------------------ */

/**
 * Un programa es ejecutable si tiene Inicio, tiene Fin y no hay bloques
 * sueltos fuera de la cadena principal.
 * @returns {{ ok: boolean, faltan: string[] }}
 */
export function validarPrograma(programa) {
  const bloques = programa?.bloques ?? [];
  const faltan = [];
  const inicio = bloques.find((b) => b.tipo === "inicio");
  const fin = bloques.find((b) => b.tipo === "fin");

  if (!inicio) faltan.push("Falta el bloque Inicio");
  if (!fin) faltan.push("Falta el bloque Fin");

  if (inicio) {
    const alcanzables = new Set([inicio.id]);
    const pendientes = [...secuenciaDesde(bloques, inicio.siguienteId)];
    while (pendientes.length) {
      const bloque = pendientes.pop();
      if (alcanzables.has(bloque.id)) continue;
      alcanzables.add(bloque.id);
      pendientes.push(
        ...secuenciaDesde(bloques, bloque.hijosId?.[0]),
        ...secuenciaDesde(bloques, bloque.hijoElseId?.[0]),
      );
    }
    const sueltos = bloques.filter((b) => !alcanzables.has(b.id));
    if (sueltos.length) {
      faltan.push(
        sueltos.length === 1
          ? "Hay 1 bloque sin conectar a la cadena principal"
          : `Hay ${sueltos.length} bloques sin conectar a la cadena principal`,
      );
    }
    if (fin && !alcanzables.has(fin.id)) faltan.push("El bloque Fin no está conectado");
  }

  return { ok: faltan.length === 0, faltan };
}

/* ------------------------------------------------------------------ *
 * Ejecución
 * ------------------------------------------------------------------ */

/**
 * Recorre la cadena desde Inicio y ejecuta cada bloque.
 * Todos los callbacks son opcionales:
 *   onStep(bloqueId)  · onOutput(texto) · onInput(mensaje) => Promise<string>
 *   onError(mensaje)  · onDone()
 */
export async function ejecutarPrograma(programa, opciones = {}) {
  const { onStep, onOutput, onInput, onError, onDone } = opciones;
  const bloques = programa?.bloques ?? [];

  const validacion = validarPrograma(programa);
  if (!validacion.ok) {
    onError?.(validacion.faltan[0] ?? "El programa aún no se puede ejecutar");
    return { ok: false, salida: [], variables: {} };
  }

  const variables = {};
  const salida = [];
  let pasos = 0;

  const emitir = (texto) => {
    salida.push(texto);
    onOutput?.(texto);
  };

  const contarPaso = () => {
    pasos += 1;
    if (pasos > LIMITE_PASOS) {
      throw new ErrorPrograma("El programa se detuvo: parece haber un ciclo infinito");
    }
  };

  async function ejecutarSecuencia(primerId) {
    for (const bloque of secuenciaDesde(bloques, primerId)) {
      contarPaso();
      if (onStep) await onStep(bloque.id);
      if (bloque.tipo === "fin") return "fin";
      const resultado = await ejecutarBloque(bloque);
      if (resultado === "fin") return "fin";
    }
    return null;
  }

  async function ejecutarBloque(bloque) {
    const p = bloque.parametros ?? {};
    switch (bloque.tipo) {
      case "inicio":
        return null;

      case "fin":
        return "fin";

      case "variable": {
        const nombre = String(p.nombre ?? "").trim();
        if (!nombre) throw new ErrorPrograma("El bloque Declarar variable necesita un nombre");
        variables[nombre] = evaluarExpresion(p.valor, variables);
        return null;
      }

      case "asignacion": {
        const nombre = String(p.variable ?? "").trim();
        if (!(nombre in variables)) {
          throw new ErrorPrograma(`La variable "${nombre}" no existe todavía`);
        }
        variables[nombre] = evaluarExpresion(p.expresion, variables);
        return null;
      }

      case "entrada": {
        const nombre = String(p.variable ?? "").trim();
        if (!nombre) throw new ErrorPrograma("El bloque Leer necesita una variable destino");
        const mensaje = p.mensaje || `Escribe un valor para ${nombre}`;
        const respuesta = onInput ? await onInput(mensaje) : "";
        const texto = String(respuesta ?? "");
        const numero = Number(texto);
        variables[nombre] = texto.trim() !== "" && !Number.isNaN(numero) ? numero : texto;
        emitir(`${nombre} = ${formatearValor(variables[nombre])}`);
        return null;
      }

      case "salida":
        emitir(formatearValor(evaluarExpresion(p.expresion, variables)));
        return null;

      case "operacion": {
        const destino = String(p.destino ?? "").trim();
        if (!destino) throw new ErrorPrograma("El bloque Operación necesita una variable destino");
        variables[destino] = evaluarExpresion(`${p.a} ${p.operador} ${p.b}`, variables);
        return null;
      }

      case "condicional": {
        const rama = esVerdadero(evaluarExpresion(p.condicion, variables))
          ? bloque.hijosId?.[0]
          : bloque.hijoElseId?.[0];
        return await ejecutarSecuencia(rama);
      }

      case "mientras": {
        while (esVerdadero(evaluarExpresion(p.condicion, variables))) {
          contarPaso();
          const resultado = await ejecutarSecuencia(bloque.hijosId?.[0]);
          if (resultado === "fin") return "fin";
        }
        return null;
      }

      case "repetir": {
        const veces = Math.max(0, Math.floor(aNumero(evaluarExpresion(p.veces, variables))));
        for (let i = 0; i < veces; i += 1) {
          contarPaso();
          const resultado = await ejecutarSecuencia(bloque.hijosId?.[0]);
          if (resultado === "fin") return "fin";
        }
        return null;
      }

      default:
        throw new ErrorPrograma(`Bloque desconocido: ${bloque.tipo}`);
    }
  }

  try {
    const inicio = bloques.find((b) => b.tipo === "inicio");
    await ejecutarSecuencia(inicio.id);
    onDone?.();
    return { ok: true, salida, variables };
  } catch (error) {
    const mensaje = error instanceof ErrorPrograma ? error.message : "Error inesperado al ejecutar";
    onError?.(mensaje);
    return { ok: false, salida, variables, error: mensaje };
  }
}
