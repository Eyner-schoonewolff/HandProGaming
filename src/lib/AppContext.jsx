import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { datosSemilla, CUENTAS_DEMO } from "@/data/seed";
import { escribir, leer, borrar } from "@/lib/storage";

const CLAVE_BD = "bd";
const CLAVE_SESION = "sesion";
const CLAVE_PROGRAMA_LIBRE = "programa-libre";
const VERSION_BD = 1;

const AppContext = createContext(null);

let contador = 0;
function nuevoId(prefijo) {
  contador += 1;
  return `${prefijo}_${Date.now().toString(36)}${contador.toString(36)}`;
}

function cargarBd() {
  const guardada = leer(CLAVE_BD, null);
  if (guardada?.version === VERSION_BD) return guardada;
  return { version: VERSION_BD, ...datosSemilla() };
}

/**
 * Estado global del MVP: una "base de datos" en memoria persistida en localStorage
 * y las acciones que la modifican. Todas las acciones son síncronas y devuelven
 * `{ ok, error }` cuando pueden fallar, para que las pantallas muestren el motivo.
 */
export function AppProvider({ children }) {
  const [db, setDb] = useState(cargarBd);
  const [user, setUser] = useState(() => {
    const sesion = leer(CLAVE_SESION, null);
    if (!sesion?.id) return null;
    const inicial = cargarBd();
    const encontrado = inicial.users.find((u) => u.id === sesion.id);
    if (!encontrado) return null;
    const { password: _password, ...perfil } = encontrado;
    return perfil;
  });

  useEffect(() => { escribir(CLAVE_BD, db); }, [db]);

  const sinPassword = (usuario) => {
    if (!usuario) return null;
    const { password: _password, ...perfil } = usuario;
    return perfil;
  };

  /* ------------------------------ Sesión ------------------------------ */

  const login = useCallback((correo, password) => {
    const normalizado = String(correo).trim().toLowerCase();
    const encontrado = db.users.find((u) => u.correo.toLowerCase() === normalizado);
    if (!encontrado) return { ok: false, error: "Ese correo no está registrado." };
    if (encontrado.password !== password) return { ok: false, error: "La contraseña no es correcta." };
    if (!encontrado.activo) return { ok: false, error: "Tu cuenta está desactivada. Contacta al administrador." };
    const perfil = sinPassword(encontrado);
    escribir(CLAVE_SESION, { id: perfil.id });
    setUser(perfil);
    return { ok: true, user: perfil };
  }, [db.users]);

  const loginDemo = useCallback((rol) => {
    const cuenta = CUENTAS_DEMO[rol];
    if (!cuenta) return { ok: false, error: "Rol demo desconocido." };
    return login(cuenta.correo, cuenta.password);
  }, [login]);

  const register = useCallback(({ nombre, correo, password, rol }) => {
    const normalizado = String(correo).trim().toLowerCase();
    if (db.users.some((u) => u.correo.toLowerCase() === normalizado)) {
      return { ok: false, error: "Ya existe una cuenta con ese correo." };
    }
    const nuevo = {
      id: nuevoId("usr"),
      nombre: String(nombre).trim(),
      correo: normalizado,
      password,
      rol,
      activo: true,
      creadoEn: new Date().toISOString(),
    };
    setDb((actual) => ({ ...actual, users: [...actual.users, nuevo] }));
    const perfil = sinPassword(nuevo);
    escribir(CLAVE_SESION, { id: perfil.id });
    setUser(perfil);
    return { ok: true, user: perfil };
  }, [db.users]);

  const logout = useCallback(() => {
    borrar(CLAVE_SESION);
    setUser(null);
  }, []);

  /* ------------------------------ Usuarios ------------------------------ */

  const updateUser = useCallback((id, cambios) => {
    setDb((actual) => ({
      ...actual,
      users: actual.users.map((u) => (u.id === id ? { ...u, ...cambios } : u)),
    }));
    setUser((actual) => (actual && actual.id === id ? { ...actual, ...cambios } : actual));
    return { ok: true };
  }, []);

  const toggleUserActivo = useCallback((id) => {
    setDb((actual) => ({
      ...actual,
      users: actual.users.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)),
    }));
    return { ok: true };
  }, []);

  /* ------------------------------ Cursos ------------------------------ */

  const crearCurso = useCallback((datos) => {
    const curso = {
      id: nuevoId("cur"),
      color: "indigo",
      totalActividades: 0,
      creadoEn: new Date().toISOString(),
      ...datos,
    };
    setDb((actual) => ({ ...actual, cursos: [...actual.cursos, curso] }));
    return curso;
  }, []);

  const matricular = useCallback((cursoId, estudianteId) => {
    if (db.matriculas.some((m) => m.cursoId === cursoId && m.estudianteId === estudianteId)) {
      return { ok: false, error: "Ya estás matriculado en este curso." };
    }
    const matricula = {
      id: nuevoId("mat"),
      cursoId,
      estudianteId,
      fecha: new Date().toISOString(),
    };
    setDb((actual) => ({ ...actual, matriculas: [...actual.matriculas, matricula] }));
    return { ok: true, matricula };
  }, [db.matriculas]);

  /* --------------------------- Actividades --------------------------- */

  const crearActividad = useCallback((datos) => {
    const actividad = {
      id: nuevoId("act"),
      creadaEn: new Date().toISOString(),
      ...datos,
    };
    setDb((actual) => ({
      ...actual,
      actividades: [...actual.actividades, actividad],
      cursos: actual.cursos.map((c) =>
        c.id === actividad.cursoId
          ? { ...c, totalActividades: (c.totalActividades ?? 0) + 1 }
          : c,
      ),
    }));
    return actividad;
  }, []);

  /** Asigna la actividad a varios estudiantes y devuelve cuántas asignaciones nuevas creó. */
  const asignarActividad = useCallback((actividadId, estudiantesIds) => {
    const nuevas = estudiantesIds
      .filter((estudianteId) =>
        !db.asignaciones.some((a) => a.actividadId === actividadId && a.estudianteId === estudianteId),
      )
      .map((estudianteId) => ({
        id: nuevoId("asg"),
        actividadId,
        estudianteId,
        estado: "pendiente",
        asignadaEn: new Date().toISOString(),
      }));
    if (nuevas.length) {
      setDb((actual) => ({ ...actual, asignaciones: [...actual.asignaciones, ...nuevas] }));
    }
    return nuevas.length;
  }, [db.asignaciones]);

  /* ----------------------- Entregas y retro ----------------------- */

  const entregar = useCallback((asignacionId, programa, salida = []) => {
    const entrega = {
      id: nuevoId("ent"),
      asignacionId,
      programa,
      salida,
      entregadaEn: new Date().toISOString(),
    };
    setDb((actual) => ({
      ...actual,
      entregas: [...actual.entregas.filter((e) => e.asignacionId !== asignacionId), entrega],
      asignaciones: actual.asignaciones.map((a) =>
        a.id === asignacionId ? { ...a, estado: "entregada" } : a,
      ),
    }));
    return entrega;
  }, []);

  const crearRetro = useCallback((entregaId, profesorId, comentario, calificacion) => {
    const retro = {
      id: nuevoId("ret"),
      entregaId,
      profesorId,
      comentario,
      calificacion,
      creadaEn: new Date().toISOString(),
    };
    setDb((actual) => {
      const entrega = actual.entregas.find((e) => e.id === entregaId);
      return {
        ...actual,
        retro: [...actual.retro.filter((r) => r.entregaId !== entregaId), retro],
        asignaciones: actual.asignaciones.map((a) =>
          entrega && a.id === entrega.asignacionId ? { ...a, estado: "revisada" } : a,
        ),
      };
    });
    return retro;
  }, []);

  /* --------------------------- Editor libre --------------------------- */

  const guardarProgramaLibre = useCallback((programa) => {
    escribir(CLAVE_PROGRAMA_LIBRE, programa);
    return { ok: true };
  }, []);

  const cargarProgramaLibre = useCallback(() => leer(CLAVE_PROGRAMA_LIBRE, null), []);

  /** Vuelve a los datos semilla (útil para demos). */
  const reiniciarDatos = useCallback(() => {
    const fresca = { version: VERSION_BD, ...datosSemilla() };
    setDb(fresca);
    escribir(CLAVE_BD, fresca);
    return { ok: true };
  }, []);

  const valor = useMemo(
    () => ({
      db, user,
      login, loginDemo, register, logout,
      updateUser, toggleUserActivo,
      crearCurso, matricular,
      crearActividad, asignarActividad,
      entregar, crearRetro,
      guardarProgramaLibre, cargarProgramaLibre,
      reiniciarDatos,
    }),
    [
      db, user, login, loginDemo, register, logout, updateUser, toggleUserActivo,
      crearCurso, matricular, crearActividad, asignarActividad, entregar, crearRetro,
      guardarProgramaLibre, cargarProgramaLibre, reiniciarDatos,
    ],
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const contexto = useContext(AppContext);
  if (!contexto) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return contexto;
}
