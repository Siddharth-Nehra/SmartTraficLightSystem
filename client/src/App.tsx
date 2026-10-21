import { Navigate, Route, Routes } from "react-router-dom";
import IntroAnimation from "./components/IntroAnimation/IntroAnimation";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";
import { hasIntroPlayed } from "./lib/auth";

function IntroRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (hasIntroPlayed()) return <Navigate to="/dashboard" replace />;
  return <IntroAnimation />;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!hasIntroPlayed()) return <Navigate to="/intro" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/intro" element={<IntroRoute />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
