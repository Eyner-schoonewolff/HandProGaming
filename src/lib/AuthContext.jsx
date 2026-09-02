import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";

const AuthContext = createContext(null);

/**
 * Estado de sesión de plataforma que consume <ProtectedRoute />.
 * La sesión funcional del MVP vive en AppContext; aquí solo se refleja si hay
 * un usuario válido detrás, con los estados que la ruta protegida necesita.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const perfil = await base44.auth.me();
      setUsuario(perfil);
    } catch {
      setUsuario(null);
      setAuthError({ type: "unauthenticated", message: "No hay una sesión activa" });
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  const valor = useMemo(
    () => ({
      user: usuario,
      isAuthenticated: Boolean(usuario),
      isLoadingAuth,
      authChecked,
      authError,
      checkUserAuth,
    }),
    [usuario, isLoadingAuth, authChecked, authError, checkUserAuth],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return contexto;
}
