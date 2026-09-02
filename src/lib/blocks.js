import {
  Flag, Square, Braces, Equal, Keyboard, Monitor,
  Sigma, GitBranch, RotateCw, Repeat,
} from "lucide-react";

/**
 * Categorías de bloques. El color nunca es el único distintivo:
 * cada categoría se muestra siempre con su nombre y cada bloque con su icono.
 */
export const CATEGORIAS = {
  control: { nombre: "Control", hex: "#10b981" },
  datos: { nombre: "Datos", hex: "#f97316" },
  es: { nombre: "Entrada / Salida", hex: "#0ea5e9" },
  operadores: { nombre: "Operadores", hex: "#8b5cf6" },
  ciclos: { nombre: "Ciclos", hex: "#ec4899" },
};

/**
 * Los diez bloques del MVP.
 * - `params`: campos editables dentro del bloque ({ key, label, placeholder, tipo, options }).
 * - `esContenedor`: tiene cuerpo anidado (`hijosId`).
 * - `tieneElse`: además tiene un segundo cuerpo (`hijoElseId`).
 * - `unico`: solo puede existir uno por programa.
 */
export const BLOQUES = {
  inicio: {
    tipo: "inicio",
    nombre: "Inicio",
    categoria: "control",
    icon: Flag,
    unico: true,
    esContenedor: false,
    tieneElse: false,
    descripcion: "Punto de partida del programa. Solo puede haber uno.",
    params: [],
  },
  fin: {
    tipo: "fin",
    nombre: "Fin",
    categoria: "control",
    icon: Square,
    unico: true,
    esContenedor: false,
    tieneElse: false,
    descripcion: "Cierra el programa. Solo puede haber uno.",
    params: [],
  },
  variable: {
    tipo: "variable",
    nombre: "Declarar variable",
    categoria: "datos",
    icon: Braces,
    esContenedor: false,
    tieneElse: false,
    descripcion: "Crea una variable con un valor inicial.",
    params: [
      { key: "nombre", label: "Nombre", placeholder: "n" },
      { key: "valor", label: "Valor", placeholder: "0" },
    ],
  },
  asignacion: {
    tipo: "asignacion",
    nombre: "Asignar",
    categoria: "datos",
    icon: Equal,
    esContenedor: false,
    tieneElse: false,
    descripcion: "Cambia el valor de una variable existente.",
    params: [
      { key: "variable", label: "Variable", placeholder: "n" },
      { key: "expresion", label: "Expresión", placeholder: "n + 1" },
    ],
  },
  entrada: {
    tipo: "entrada",
    nombre: "Leer",
    categoria: "es",
    icon: Keyboard,
    esContenedor: false,
    tieneElse: false,
    descripcion: "Pide un dato al usuario y lo guarda en una variable.",
    params: [
      { key: "variable", label: "Guardar en", placeholder: "n" },
      { key: "mensaje", label: "Mensaje", placeholder: "Escribe un número" },
    ],
  },
  salida: {
    tipo: "salida",
    nombre: "Mostrar",
    categoria: "es",
    icon: Monitor,
    esContenedor: false,
    tieneElse: false,
    descripcion: "Escribe un texto o el valor de una expresión en la consola.",
    params: [{ key: "expresion", label: "Mostrar", placeholder: '"Hola mundo"' }],
  },
  operacion: {
    tipo: "operacion",
    nombre: "Operación",
    categoria: "operadores",
    icon: Sigma,
    esContenedor: false,
    tieneElse: false,
    descripcion: "Calcula a (operador) b y guarda el resultado en una variable.",
    params: [
      { key: "destino", label: "Guardar en", placeholder: "r" },
      { key: "a", label: "a", placeholder: "1" },
      { key: "operador", label: "Operador", tipo: "select", options: ["+", "-", "*", "/", "%"] },
      { key: "b", label: "b", placeholder: "2" },
    ],
  },
  condicional: {
    tipo: "condicional",
    nombre: "Si / Si-No",
    categoria: "control",
    icon: GitBranch,
    esContenedor: true,
    tieneElse: true,
    descripcion: "Ejecuta un cuerpo u otro según se cumpla la condición.",
    params: [{ key: "condicion", label: "Condición", placeholder: "n > 0" }],
  },
  mientras: {
    tipo: "mientras",
    nombre: "Mientras",
    categoria: "ciclos",
    icon: RotateCw,
    esContenedor: true,
    tieneElse: false,
    descripcion: "Repite el cuerpo mientras la condición sea verdadera.",
    params: [{ key: "condicion", label: "Condición", placeholder: "n < 5" }],
  },
  repetir: {
    tipo: "repetir",
    nombre: "Repetir N veces",
    categoria: "ciclos",
    icon: Repeat,
    esContenedor: true,
    tieneElse: false,
    descripcion: "Repite el cuerpo un número fijo de veces.",
    params: [{ key: "veces", label: "Veces", placeholder: "3" }],
  },
};

export const TIPOS_BLOQUE = Object.keys(BLOQUES);

/** Valores iniciales de los parámetros de un bloque recién creado. */
export function parametrosPorDefecto(tipo) {
  const def = BLOQUES[tipo];
  if (!def) return {};
  return Object.fromEntries(
    def.params.map((p) => [p.key, p.tipo === "select" ? p.options[0] : (p.placeholder ?? "")]),
  );
}

export function categoriaDe(tipo) {
  return CATEGORIAS[BLOQUES[tipo]?.categoria] ?? CATEGORIAS.control;
}
