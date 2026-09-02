import { borrar, escribir, leer } from "@/lib/storage";

const CLAVE = "auth:returnTo";

/** Guarda la ruta a la que el usuario quería entrar antes de iniciar sesión. */
export function guardarDestino(ruta) {
  if (!ruta || ruta.startsWith("/login") || ruta.startsWith("/registro")) return;
  escribir(CLAVE, ruta);
}

/** Devuelve y limpia el destino guardado. */
export function tomarDestino() {
  const ruta = leer(CLAVE, null);
  borrar(CLAVE);
  return ruta;
}

export const INICIO_POR_ROL = {
  estudiante: "/estudiante",
  profesor: "/profesor",
  admin: "/admin",
};

export function inicioDeRol(rol) {
  return INICIO_POR_ROL[rol] ?? "/";
}
