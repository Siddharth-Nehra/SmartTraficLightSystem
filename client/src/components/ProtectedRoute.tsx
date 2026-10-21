import { Navigate } from "react-router-dom";
import { hasIntroPlayed } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireIntro?: boolean;
}

export default function ProtectedRoute({
  children,
  requireIntro = true,
}: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireIntro && !hasIntroPlayed()) {
    return <Navigate to="/intro" replace />;
  }

  return <>{children}</>;
}
