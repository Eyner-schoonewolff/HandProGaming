const PREFIJO = "hpg:";

function disponible() {
  try {
    const prueba = `${PREFIJO}__test__`;
    window.localStorage.setItem(prueba, "1");
    window.localStorage.removeItem(prueba);
    return true;
  } catch {
    return false;
  }
}

const memoria = new Map();
const usaLocalStorage = typeof window !== "undefined" && disponible();

export function leer(clave, porDefecto = null) {
  try {
    const bruto = usaLocalStorage
      ? window.localStorage.getItem(PREFIJO + clave)
      : memoria.get(clave);
    if (bruto == null) return porDefecto;
    return JSON.parse(bruto);
  } catch {
    return porDefecto;
  }
}

export function escribir(clave, valor) {
  const bruto = JSON.stringify(valor);
  try {
    if (usaLocalStorage) window.localStorage.setItem(PREFIJO + clave, bruto);
    else memoria.set(clave, bruto);
  } catch {
    memoria.set(clave, bruto);
  }
  return valor;
}

export function borrar(clave) {
  if (usaLocalStorage) window.localStorage.removeItem(PREFIJO + clave);
  memoria.delete(clave);
}

export function limpiarTodo() {
  if (usaLocalStorage) {
    Object.keys(window.localStorage)
      .filter((clave) => clave.startsWith(PREFIJO))
      .forEach((clave) => window.localStorage.removeItem(clave));
  }
  memoria.clear();
}
