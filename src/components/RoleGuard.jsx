import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

// Protege rutas por rol. Si no hay sesión -> /login. Si el rol no corresponde -> dashboard del rol.
export default function RoleGuard({ roles, children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) {
    const dest = `/${user.rol}`;
    return <Navigate to={dest} replace />;
  }
  return children;
}