import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { markIntroPlayed } from "../../lib/auth";
import BackgroundEffects from "./BackgroundEffects";
import TrafficIntersection, { type IntersectionSignals } from "./TrafficIntersection";
import { useIntroSounds } from "./useIntroSounds";

const SYSTEM_LINES = [
  "Initializing Smart Traffic Network...",
  "Loading Control Center & Telemetry...",
  "Optimizing Priority Scheduling Algorithm...",
  "OS Kernel Ready & Active",
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function IntroAnimation() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [visibleLine, setVisibleLine] = useState(0);
  const [signals, setSignals] = useState<IntersectionSignals>({
    north: "red",
    south: "red",
    east: "red",
    west: "red",
  });

  useIntroSounds(phase);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => {
      markIntroPlayed();
      navigate("/dashboard", { replace: true });
    }, 400);
  };

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1400),
      setTimeout(() => {
        setPhase(2);
        setSignals({ north: "red", south: "green", east: "red", west: "red" });
      }, 2800),
      setTimeout(() => {
        setSignals({ north: "yellow", south: "yellow", east: "yellow", west: "yellow" });
      }, 3600),
      setTimeout(() => {
        setSignals({ north: "red", south: "green", east: "red", west: "red" });
      }, 4000),
      setTimeout(() => setPhase(3), 4800),
      setTimeout(() => {
        setSignals({ north: "red", south: "red", east: "red", west: "green" });
      }, 5000),
      setTimeout(() => setPhase(4), 5800),
      setTimeout(() => setPhase(5), 6800),
      setTimeout(() => setFadeOut(true), 7400),
      setTimeout(() => {
        markIntroPlayed();
        navigate("/dashboard", { replace: true });
      }, 7900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  useEffect(() => {
    if (phase !== 4) return;
    const timers = SYSTEM_LINES.map((_, i) =>
      setTimeout(() => setVisibleLine(i), i * 400)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const showRoads = phase >= 1;
  const showLights = phase >= 1;
  const showVehicles = phase >= 2 && phase < 4;
  const showAmbulance = phase >= 3;
  const zoom = phase >= 4 ? 0.72 : 1;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#030712] select-none"
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.5, ease }}
    >
      <BackgroundEffects />

      {/* Top Telemetry HUD Header */}
      <div className="pointer-events-none absolute top-6 inset-x-8 z-30 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-semibold">SYS // ONLINE</span>
          <span className="hidden sm:inline text-slate-600">| PRIORITY ENGINE V2.0</span>
        </div>
        <div className="pointer-events-auto">
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/40 px-4 py-1.5 font-mono text-xs text-sky-300 backdrop-blur-md transition hover:border-sky-400 hover:bg-sky-900/60 hover:text-white"
          >
            <span>SKIP INTRO</span>
            <span>➔</span>
          </button>
        </div>
      </div>

      {/* Central Glow Orb */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{
          opacity: phase === 0 ? [0, 0.8, 0.5] : 0.2,
          scale: phase === 0 ? [0.2, 1.3, 1] : 1.6,
        }}
        transition={{ duration: 1.5, ease }}
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.3) 0%, rgba(59,130,246,0.12) 45%, transparent 70%)",
        }}
      />

      {/* Scene 1: Title */}
      <AnimatePresence>
        {phase === 0 && (
          <motion.div
            key="title"
            className="relative z-10 flex flex-col items-center px-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
            transition={{ duration: 0.8, ease }}
          >
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1 backdrop-blur-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-base">🚦</span>
              <span className="font-mono text-xs font-semibold tracking-widest text-sky-400">
                NEXT-GEN SMART CITY
              </span>
            </motion.div>

            <motion.h1
              className="font-display text-4xl font-extrabold tracking-[0.2em] text-white sm:text-5xl md:text-6xl text-glow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease }}
            >
              SMART CITY
            </motion.h1>
            <motion.h2
              className="mt-3 font-display text-base font-semibold tracking-[0.25em] text-sky-300 sm:text-xl md:text-2xl text-glow"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.8, ease }}
            >
              TRAFFIC MANAGEMENT SYSTEM
            </motion.h2>
            <motion.p
              className="mt-6 max-w-md font-mono text-xs tracking-wider text-slate-400 sm:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              Real-time Traffic Dispatch & Priority Scheduling Algorithm
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenes 2–5: Intersection */}
      {phase >= 1 && phase <= 4 && (
        <motion.div
          className="relative z-10 h-[min(70vw,420px)] w-[min(70vw,420px)]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease }}
        >
          <TrafficIntersection
            showRoads={showRoads}
            showLights={showLights}
            showVehicles={showVehicles}
            showAmbulance={showAmbulance}
            signals={signals}
            zoom={zoom}
          />
        </motion.div>
      )}

      {/* Scene 4: Emergency notifications */}
      <AnimatePresence>
        {phase === 3 && (
          <>
            <motion.div
              key="emergency-alert"
              className="absolute bottom-[16%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-red-500/40 bg-slate-950/90 p-4 shadow-[0_0_50px_rgba(239,68,68,0.3)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease }}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-3xl"
              >
                🚑
              </motion.span>
              <div>
                <p className="font-display text-sm font-bold tracking-wider text-red-400">
                  EMERGENCY VEHICLE DETECTED
                </p>
                <motion.p
                  className="mt-0.5 font-mono text-xs text-slate-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  West Lane Priority Override Activated
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              key="priority-alert"
              className="absolute top-[16%] left-1/2 z-20 -translate-x-1/2 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-6 py-2 shadow-[0_0_30px_rgba(34,197,94,0.3)] backdrop-blur-md"
              initial={{ opacity: 0, y: -24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ delay: 0.4, duration: 0.5, ease }}
            >
              <p className="font-display text-xs font-bold tracking-[0.2em] text-emerald-400">
                PRIORITY SCHEDULING ACTIVATED
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Scene 5: System init text */}
      <AnimatePresence>
        {phase === 4 && (
          <motion.div
            key="system-init"
            className="absolute bottom-[10%] left-1/2 z-20 w-full max-w-md -translate-x-1/2 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="rounded-2xl border border-sky-500/20 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl space-y-3">
              {SYSTEM_LINES.map((line, i) => (
                <motion.div
                  key={line}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{
                    opacity: i <= visibleLine ? 1 : 0,
                    x: i <= visibleLine ? 0 : -12,
                  }}
                  transition={{ duration: 0.4, ease }}
                >
                  <motion.span
                    className={`h-2 w-2 rounded-full ${
                      i < visibleLine
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                        : i === visibleLine
                          ? "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]"
                          : "bg-slate-700"
                    }`}
                    animate={i === visibleLine ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.6, repeat: i === visibleLine ? Infinity : 0 }}
                  />
                  <span
                    className={`font-mono text-xs tracking-wide ${
                      i <= visibleLine ? "text-sky-200 font-medium" : "text-slate-600"
                    }`}
                  >
                    {line}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene 6: Launch */}
      <AnimatePresence>
        {phase === 5 && (
          <motion.div
            key="launch"
            className="relative z-20 flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative flex h-24 w-24 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border border-sky-400/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-transparent border-t-sky-400 border-r-sky-400/50"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full bg-sky-500/10 shadow-[0_0_20px_rgba(56,189,248,0.5)]"
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-3xl">🚦</span>
            </div>

            <motion.p
              className="font-display text-sm tracking-[0.3em] text-sky-300 font-bold text-glow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              LAUNCHING DASHBOARD...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
