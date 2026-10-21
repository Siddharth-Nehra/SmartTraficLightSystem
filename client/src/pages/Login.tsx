import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasIntroPlayed } from "../lib/auth";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <Navigate to={hasIntroPlayed() ? "/dashboard" : "/intro"} replace />
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate(hasIntroPlayed() ? "/dashboard" : "/intro");
    } else {
      setError(result.error || "Login failed.");
    }
  }

  function fillDemo(user: string, pass: string) {
    setUsername(user);
    setPassword(pass);
  }

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-cyber-950 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent_60%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel relative z-10 w-full max-w-md p-8"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyber-400/30 bg-cyber-500/10 text-3xl shadow-neon-sm"
          >
            🚦
          </motion.div>
          <h1 className="font-display text-xl font-bold tracking-wide text-white">
            Smart Traffic Light Control
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Priority Scheduling — Smart City Control Center
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin or operator"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyber-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-neon-sm transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </motion.button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="mb-3 text-center text-xs text-slate-500">Quick demo login</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemo("admin", "admin123")}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:border-cyber-400/30 hover:bg-cyber-500/10"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo("operator", "operator123")}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:border-cyber-400/30 hover:bg-cyber-500/10"
            >
              Operator
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
