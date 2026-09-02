/**
 * Cliente de la plataforma.
 *
 * El MVP funciona con datos locales (ver src/lib/AppContext.jsx), así que este
 * cliente solo cubre las pantallas de plataforma: sesión, recuperación de
 * contraseña y la página 404. Cuando exista un backend real, basta con
 * reemplazar estas funciones por llamadas HTTP.
 */
import { leer, escribir } from "@/lib/storage";
import { appParams } from "@/lib/app-params";

const CLAVE_SESION = "sesion";
const CLAVE_BD = "bd";

function usuarioDeSesion() {
  const sesion = leer(CLAVE_SESION, null);
  if (!sesion?.id) return null;
  const bd = leer(CLAVE_BD, null);
  const encontrado = bd?.users?.find((u) => u.id === sesion.id);
  if (!encontrado) return null;
  const { password: _password, ...perfil } = encontrado;
  return perfil;
}

export const base44 = {
  appId: appParams.appId,

  auth: {
    /** Perfil de la sesión actual. Rechaza si no hay sesión (lo espera PageNotFound). */
    async me() {
      const usuario = usuarioDeSesion();
      if (!usuario) throw new Error("No hay una sesión activa");
      return usuario;
    },

    isAuthenticated() {
      return Boolean(usuarioDeSesion());
    },

    /**
     * Solicita el restablecimiento de contraseña. En local no hay correo: se
     * genera un token de un solo uso que la pantalla de reset puede usar.
     */
    async resetPasswordRequest(correo) {
      const normalizado = String(correo).trim().toLowerCase();
      const bd = leer(CLAVE_BD, null);
      const existe = bd?.users?.some((u) => u.correo.toLowerCase() === normalizado);
      if (!existe) return { ok: true }; // no revelamos si el correo existe
      escribir("reset-token", { correo: normalizado, token: `local-${Date.now()}` });
      return { ok: true };
    },

    async resetPassword({ resetToken, newPassword }) {
      const pendiente = leer("reset-token", null);
      if (!pendiente || (resetToken && resetToken !== pendiente.token)) {
        throw new Error("El enlace de restablecimiento ya no es válido");
      }
      if (!newPassword || newPassword.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres");
      }
      const bd = leer(CLAVE_BD, null);
      if (!bd) throw new Error("No pudimos actualizar la contraseña");
      escribir(CLAVE_BD, {
        ...bd,
        users: bd.users.map((u) =>
          u.correo.toLowerCase() === pendiente.correo ? { ...u, password: newPassword } : u,
        ),
      });
      return { ok: true };
    },

    logout() {
      escribir(CLAVE_SESION, null);
      return { ok: true };
    },
  },
};

export default base44;
