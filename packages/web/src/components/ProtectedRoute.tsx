import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
