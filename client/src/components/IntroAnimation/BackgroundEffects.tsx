import { motion } from "framer-motion";
import { useMemo } from "react";

const PARTICLE_COUNT = 40;

export default function BackgroundEffects() {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 4,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.12) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(59,130,246,0.08), transparent 70%)",
        }}
      />

      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyber-glow/60"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-cyber-400/20 to-transparent"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-cyber-400/15 to-transparent"
        animate={{ opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
      />
    </div>
  );
}
