import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function ahora() {
  return new Date().toISOString();
}

const FORMATO_FECHA = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatearFecha(iso) {
  if (!iso) return "—";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "—";
  return FORMATO_FECHA.format(fecha);
}

export function iniciales(nombre = "") {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

/** Retraso artificial para que los estados de carga sean visibles y realistas. */
export function esperar(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
