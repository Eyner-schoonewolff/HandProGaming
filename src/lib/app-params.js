/**
 * Parámetros del entorno de la app (identificador y token de sesión de la
 * plataforma). En el MVP local no hay plataforma detrás: se leen de la URL o de
 * localStorage y quedan vacíos, que es justo lo que esperan las pantallas
 * opcionales de la plataforma (consentimiento OAuth, recuperación de clave).
 */
function leerToken() {
  try {
    return (
      new URLSearchParams(window.location.search).get("access_token") ||
      window.localStorage.getItem("base44_token") ||
      ""
    );
  } catch {
    return "";
  }
}

function leerAppId() {
  try {
    return (
      new URLSearchParams(window.location.search).get("app_id") ||
      window.localStorage.getItem("base44_app_id") ||
      "local"
    );
  } catch {
    return "local";
  }
}

export const appParams = {
  get appId() {
    return leerAppId();
  },
  get token() {
    return leerToken();
  },
};

export default appParams;
