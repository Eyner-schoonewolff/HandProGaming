
import { secuenciaDesde } from "./program";

const LIMITE_PASOS = 10000;

export class ErrorPrograma extends Error {
  constructor(message) {
    super(message);
    this.name = "ErrorPrograma";
  }
}

// ============================================================
// EXPRESIONES
// ============================================================

function tokenizar(entrada) {
  const tokens = [];
  const regex =
    /\s*(?:(\d+(?:\.\d+)?)|(".*?"|'.*?')|([A-Za-zÁÉÍÓÚáéíóúÑñ_][A-Za-zÁÉÍÓÚáéíóúÑñ0-9_]*)|(==|!=|>=|<=|&&|\|\||[+\-*/%<>=!()]))/gy;

  let posicion = 0;

  while (posicion < entrada.length) {
    regex.lastIndex = posicion;
    const match = regex.exec(entrada);

    if (!match) {
      throw new ErrorPrograma(
        `Expresión inválida cerca de: "${entrada.slice(posicion)}"`
      );
    }

    posicion = regex.lastIndex;

    const [, numero, texto, identificador, operador] = match;

    if (numero !== undefined) {
      tokens.push({ tipo: "numero", valor: Number(numero) });
    } else if (texto !== undefined) {
      tokens.push({
        tipo: "texto",
        valor: texto.slice(1, -1),
      });
    } else if (identificador !== undefined) {
      const palabra = identificador.toLowerCase();

      if (palabra === "verdadero") {
        tokens.push({ tipo: "booleano", valor: true });
      } else if (palabra === "falso") {
        tokens.push({ tipo: "booleano", valor: false });
      } else if (palabra === "y") {
        tokens.push({ tipo: "operador", valor: "&&" });
      } else if (palabra === "o") {
        tokens.push({ tipo: "operador", valor: "||" });
      } else if (palabra === "no") {
        tokens.push({ tipo: "operador", valor: "!" });
      } else {
        tokens.push({
          tipo: "identificador",
          valor: identificador,
        });
      }
    } else {
      tokens.push({
        tipo: "operador",
        valor: operador,
      });
    }
  }

  tokens.push({ tipo: "fin" });

  return tokens;
}

function aNumero(valor) {
  const numero = Number(valor);

  if (Number.isNaN(numero)) {
    throw new ErrorPrograma(`"${valor}" no es un número.`);
  }

  return numero;
}

function esVerdadero(valor) {
  return Boolean(valor);
}

function formatearValor(valor) {
  if (valor === true) return "verdadero";
  if (valor === false) return "falso";
  if (valor === null || valor === undefined) return "";
  return String(valor);
}

function analizar(tokens, variables) {
  let posicion = 0;

  const actual = () => tokens[posicion];

  function consumir(valor) {
    if (actual().valor === valor) {
      posicion++;
      return true;
    }

    return false;
  }

  function primario() {
    const token = actual();

    if (consumir("(")) {
      const resultado = logicoO();

      if (!consumir(")")) {
        throw new ErrorPrograma("Falta cerrar paréntesis.");
      }

      return resultado;
    }

    if (consumir("-")) {
      return -aNumero(primario());
    }

    if (consumir("!")) {
      return !esVerdadero(primario());
    }

    if (token.tipo === "numero") {
      posicion++;
      return token.valor;
    }

    if (token.tipo === "texto") {
      posicion++;
      return token.valor;
    }

    if (token.tipo === "booleano") {
      posicion++;
      return token.valor;
    }

    if (token.tipo === "identificador") {
      posicion++;

      if (!(token.valor in variables)) {
        throw new ErrorPrograma(
          `La variable "${token.valor}" no existe.`
        );
      }

      return variables[token.valor];
    }

    throw new ErrorPrograma("No se pudo interpretar la expresión.");
  }

  function multiplicacion() {
    let izquierda = primario();

    while (
      actual().valor === "*" ||
      actual().valor === "/" ||
      actual().valor === "%"
    ) {
      const operador = actual().valor;
      posicion++;

      const derecha = primario();
      const a = aNumero(izquierda);
      const b = aNumero(derecha);

      if (operador === "*") izquierda = a * b;
      if (operador === "/") {
        if (b === 0) {
          throw new ErrorPrograma("No se puede dividir entre cero.");
        }

        izquierda = a / b;
      }

      if (operador === "%") izquierda = a % b;
    }

    return izquierda;
  }

  function suma() {
    let izquierda = multiplicacion();

    while (
      actual().valor === "+" ||
      actual().valor === "-"
    ) {
      const operador = actual().valor;
      posicion++;

      const derecha = multiplicacion();

      if (
        operador === "+" &&
        (typeof izquierda === "string" ||
          typeof derecha === "string")
      ) {
        izquierda = formatearValor(izquierda) + formatearValor(derecha);
      } else {
        const a = aNumero(izquierda);
        const b = aNumero(derecha);

        izquierda =
          operador === "+" ? a + b : a - b;
      }
    }

    return izquierda;
  }

  function comparacion() {
    let izquierda = suma();

    while (
      ["==", "!=", ">", "<", ">=", "<="].includes(actual().valor)
    ) {
      const operador = actual().valor;
      posicion++;

      const derecha = suma();

      switch (operador) {
        case "==":
          izquierda = izquierda === derecha;
          break;

        case "!=":
          izquierda = izquierda !== derecha;
          break;

        case ">":
          izquierda = izquierda > derecha;
          break;

        case "<":
          izquierda = izquierda < derecha;
          break;

        case ">=":
          izquierda = izquierda >= derecha;
          break;

        case "<=":
          izquierda = izquierda <= derecha;
          break;
      }
    }

    return izquierda;
  }

  function logicoY() {
    let izquierda = comparacion();

    while (consumir("&&")) {
      const derecha = comparacion();
      izquierda = esVerdadero(izquierda) && esVerdadero(derecha);
    }

    return izquierda;
  }

  function logicoO() {
    let izquierda = logicoY();

    while (consumir("||")) {
      const derecha = logicoY();
      izquierda = esVerdadero(izquierda) || esVerdadero(derecha);
    }

    return izquierda;
  }

  const resultado = logicoO();

  if (actual().tipo !== "fin") {
    throw new ErrorPrograma(
      `No se pudo interpretar "${actual().valor}".`
    );
  }

  return resultado;
}

function evaluarExpresion(expresion, variables) {
  if (expresion === null || expresion === undefined) {
    return "";
  }

  const texto = String(expresion).trim();

  if (!texto) return "";

  return analizar(tokenizar(texto), variables);
}

// ============================================================
// VALIDACIÓN
// ============================================================

export function validarPrograma(programa) {
  const bloques = programa?.bloques || [];

  const inicio = bloques.find(
    (bloque) => bloque.tipo === "inicio"
  );

  const fin = bloques.find(
    (bloque) => bloque.tipo === "fin"
  );

  const faltan = [];

  if (!inicio) faltan.push("Inicio");
  if (!fin) faltan.push("Fin");

  if (!inicio || !fin) {
    return {
      ok: false,
      faltan,
    };
  }

  const visitados = new Set();

  function visitar(id) {
    if (!id || visitados.has(id)) return;

    visitados.add(id);

    const bloque = bloques.find((item) => item.id === id);

    if (!bloque) return;

    visitar(bloque.siguienteId);

    if (bloque.hijosId?.[0]) {
      visitar(bloque.hijosId[0]);
    }

    if (bloque.hijoElseId?.[0]) {
      visitar(bloque.hijoElseId[0]);
    }
  }

  visitar(inicio.id);

  const desconectados = bloques
    .filter((bloque) => !visitados.has(bloque.id))
    .filter(
      (bloque) =>
        bloque.tipo !== "inicio" &&
        bloque.tipo !== "fin"
    );

  if (desconectados.length > 0) {
    faltan.push(
      `Hay ${desconectados.length} bloque(s) desconectado(s)`
    );
  }

  if (!visitados.has(fin.id)) {
    faltan.push("El bloque Fin no está conectado");
  }

  return {
    ok: faltan.length === 0,
    faltan,
  };
}

// ============================================================
// EJECUCIÓN
// ============================================================

export async function ejecutarPrograma(
  programa,
  opciones = {}
) {
  const {
    onStep,
    onOutput,
    onInput,
    onError,
    onDone,
    signal,
  } = opciones;

  const bloques = programa?.bloques || [];

  const validacion = validarPrograma(programa);

  if (!validacion.ok) {
    const error = new ErrorPrograma(
      validacion.faltan.join(". ")
    );

    onError?.(error);

    return {
      ok: false,
      salida: [],
      variables: {},
      error,
    };
  }

  const variables = {};
  const salida = [];

  let pasos = 0;

  function comprobarCancelacion() {
    if (signal?.aborted) {
      throw new ErrorPrograma("Ejecución cancelada.");
    }
  }

  function contarPaso() {
    comprobarCancelacion();

    pasos++;

    if (pasos > LIMITE_PASOS) {
      throw new ErrorPrograma(
        `Se alcanzó el límite de ${LIMITE_PASOS} pasos.`
      );
    }
  }

  async function emitir(valor) {
    comprobarCancelacion();

    const texto = formatearValor(valor);

    salida.push(texto);

    await onOutput?.(texto);
  }

  async function ejecutarSecuencia(primerId) {
    const secuencia = secuenciaDesde(
      bloques,
      primerId
    );

    for (const bloque of secuencia) {
      contarPaso();

      await onStep?.(bloque.id);

      comprobarCancelacion();

      if (bloque.tipo === "fin") {
        return "fin";
      }

      const resultado = await ejecutarBloque(bloque);

      if (resultado === "fin") {
        return "fin";
      }
    }

    return null;
  }

  async function ejecutarBloque(bloque) {
    comprobarCancelacion();

    switch (bloque.tipo) {
      case "inicio":
        return null;

      case "fin":
        return "fin";

      case "variable": {
        const nombre = bloque.nombre;

        if (!nombre) {
          throw new ErrorPrograma(
            "La variable no tiene nombre."
          );
        }

        variables[nombre] = evaluarExpresion(
          bloque.valor ?? "",
          variables
        );

        return null;
      }

      case "asignacion": {
        const nombre = bloque.variable;

        if (!(nombre in variables)) {
          throw new ErrorPrograma(
            `La variable "${nombre}" no existe.`
          );
        }

        variables[nombre] = evaluarExpresion(
          bloque.valor ?? "",
          variables
        );

        return null;
      }

      case "entrada": {
        const nombre = bloque.variable;

        if (!nombre) {
          throw new ErrorPrograma(
            "La entrada no tiene variable."
          );
        }

        const valor = await onInput?.(
          bloque.mensaje || "Ingrese un valor:"
        );

        comprobarCancelacion();

        const texto = String(valor ?? "").trim();

        variables[nombre] =
          texto !== "" && !Number.isNaN(Number(texto))
            ? Number(texto)
            : texto;

        await emitir(variables[nombre]);

        return null;
      }

      case "salida": {
        const valor = evaluarExpresion(
          bloque.valor ?? "",
          variables
        );

        await emitir(valor);

        return null;
      }

      case "operacion": {
        const destino = bloque.destino;

        if (!(destino in variables)) {
          throw new ErrorPrograma(
            `La variable "${destino}" no existe.`
          );
        }

        const resultado = evaluarExpresion(
          `${bloque.a ?? ""} ${bloque.operador ?? "+"} ${
            bloque.b ?? ""
          }`,
          variables
        );

        variables[destino] = resultado;

        return null;
      }

      case "condicional": {
        const condicion = evaluarExpresion(
          bloque.condicion ?? "",
          variables
        );

        const rama = esVerdadero(condicion)
          ? bloque.hijosId?.[0]
          : bloque.hijoElseId?.[0];

        if (!rama) return null;

        return await ejecutarSecuencia(rama);
      }

      case "mientras": {
        while (
          esVerdadero(
            evaluarExpresion(
              bloque.condicion ?? "",
              variables
            )
          )
        ) {
          contarPaso();

          const resultado = await ejecutarSecuencia(
            bloque.hijosId?.[0]
          );

          if (resultado === "fin") {
            return "fin";
          }
        }

        return null;
      }

      case "repetir": {
        const veces = Math.max(
          0,
          Math.floor(
            aNumero(
              evaluarExpresion(
                bloque.veces ?? 0,
                variables
              )
            )
          )
        );

        for (let i = 0; i < veces; i++) {
          contarPaso();

          const resultado = await ejecutarSecuencia(
            bloque.hijosId?.[0]
          );

          if (resultado === "fin") {
            return "fin";
          }
        }

        return null;
      }

      default:
        throw new ErrorPrograma(
          `Tipo de bloque desconocido: ${bloque.tipo}`
        );
    }
  }

  try {
    comprobarCancelacion();

    const inicio = bloques.find(
      (bloque) => bloque.tipo === "inicio"
    );

    await ejecutarSecuencia(inicio.id);

    comprobarCancelacion();

    onDone?.();

    return {
      ok: true,
      salida,
      variables,
    };
  } catch (error) {
    onError?.(error);

    return {
      ok: false,
      salida,
      variables,
      error,
    };
  }
}

