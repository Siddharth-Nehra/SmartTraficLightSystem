import { motion } from "framer-motion";

type LightColor = "red" | "yellow" | "green";

interface TrafficLightProps {
  x: number;
  y: number;
  rotation?: number;
  active: LightColor;
  visible?: boolean;
}

function TrafficLight({ x, y, rotation = 0, active, visible = true }: TrafficLightProps) {
  const colors: LightColor[] = ["red", "yellow", "green"];
  const colorMap = {
    red: "#ef4444",
    yellow: "#eab308",
    green: "#22c55e",
  };

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
    >
      <rect
        x="-8"
        y="-22"
        width="16"
        height="44"
        rx="4"
        fill="rgba(15,23,42,0.9)"
        stroke="rgba(56,189,248,0.3)"
        strokeWidth="1"
      />
      {colors.map((color, i) => (
        <circle
          key={color}
          cx="0"
          cy={-14 + i * 14}
          r="4"
          fill={active === color ? colorMap[color] : "rgba(30,41,59,0.8)"}
          style={{
            filter:
              active === color
                ? `drop-shadow(0 0 8px ${colorMap[color]}) drop-shadow(0 0 16px ${colorMap[color]}80)`
                : undefined,
          }}
        />
      ))}
    </motion.g>
  );
}

interface VehicleProps {
  emoji: string;
  className?: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  delay?: number;
  duration?: number;
  active?: boolean;
  paused?: boolean;
}

function VehicleOverlay({
  emoji,
  className = "",
  from,
  to,
  delay = 0,
  duration = 2.5,
  active = true,
  paused = false,
}: VehicleProps) {
  if (!active) return null;

  return (
    <motion.div
      className={`absolute flex h-6 w-6 items-center justify-center text-base ${className}`}
      style={{ left: from.x, top: from.y, marginLeft: -12, marginTop: -12 }}
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{
        opacity: 1,
        x: paused ? [0, to.x - from.x, to.x - from.x] : [0, to.x - from.x],
        y: paused ? [0, to.y - from.y, to.y - from.y] : [0, to.y - from.y],
      }}
      transition={{
        duration,
        delay,
        times: paused ? [0, 0.35, 1] : [0, 1],
        ease: [0.4, 0, 0.2, 1],
        repeat: paused ? 0 : Infinity,
        repeatDelay: 2,
      }}
    >
      {emoji}
    </motion.div>
  );
}

export interface IntersectionSignals {
  north: LightColor;
  south: LightColor;
  east: LightColor;
  west: LightColor;
}

interface TrafficIntersectionProps {
  showRoads?: boolean;
  showLights?: boolean;
  showVehicles?: boolean;
  showAmbulance?: boolean;
  signals?: IntersectionSignals;
  zoom?: number;
  className?: string;
}

const defaultSignals: IntersectionSignals = {
  north: "red",
  south: "green",
  east: "red",
  west: "red",
};

export default function TrafficIntersection({
  showRoads = false,
  showLights = false,
  showVehicles = false,
  showAmbulance = false,
  signals = defaultSignals,
  zoom = 1,
  className = "",
}: TrafficIntersectionProps) {
  const cx = 200;
  const cy = 200;

  return (
    <motion.div
      className={`relative aspect-square w-full ${className}`}
      animate={{ scale: zoom }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg viewBox="0 0 400 400" className="h-full w-full drop-shadow-neon">
        <defs>
          <linearGradient id="roadGlowH" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="roadGlowV" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Road base */}
        <rect x="0" y={cy - 28} width="400" height="56" fill="#0f172a" rx="2" />
        <rect x={cx - 28} y="0" width="56" height="400" fill="#0f172a" rx="2" />

        {/* Animated road lines */}
        {showRoads && (
          <>
            <motion.line
              x1="0"
              y1={cy}
              x2="400"
              y2={cy}
              stroke="url(#roadGlowH)"
              strokeWidth="2"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.line
              x1={cx}
              y1="0"
              x2={cx}
              y2="400"
              stroke="url(#roadGlowV)"
              strokeWidth="2"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        )}

        {/* Lane markings */}
        {showRoads && (
          <>
            {[80, 160, 240, 320].map((x) => (
              <motion.line
                key={`h-${x}`}
                x1={x}
                y1={cy - 4}
                x2={x + 20}
                y2={cy - 4}
                stroke="rgba(148,163,184,0.3)"
                strokeWidth="1"
                strokeDasharray="8 8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + x / 400 }}
              />
            ))}
            {[80, 160, 240, 320].map((y) => (
              <motion.line
                key={`v-${y}`}
                x1={cx - 4}
                y1={y}
                x2={cx - 4}
                y2={y + 20}
                stroke="rgba(148,163,184,0.3)"
                strokeWidth="1"
                strokeDasharray="8 8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + y / 400 }}
              />
            ))}
          </>
        )}

        {/* Intersection hub */}
        <motion.circle
          cx={cx}
          cy={cy}
          r="24"
          fill="#030712"
          stroke="rgba(56,189,248,0.5)"
          strokeWidth="1.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: showRoads ? 1 : 0, opacity: showRoads ? 1 : 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r="32"
          fill="none"
          stroke="rgba(56,189,248,0.15)"
          strokeWidth="1"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Direction labels */}
        {showRoads && (
          <>
            {[
              { label: "NORTH", x: cx, y: 24 },
              { label: "SOUTH", x: cx, y: 376 },
              { label: "EAST", x: 376, y: cy + 4 },
              { label: "WEST", x: 24, y: cy + 4 },
            ].map(({ label, x, y }) => (
              <motion.text
                key={label}
                x={x}
                y={y}
                textAnchor="middle"
                className="fill-cyber-300/60 font-mono text-[8px] tracking-[0.2em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {label}
              </motion.text>
            ))}
          </>
        )}

        {/* Traffic lights */}
        <TrafficLight x={cx} y={cy - 52} active={signals.north} visible={showLights} />
        <TrafficLight x={cx} y={cy + 52} rotation={180} active={signals.south} visible={showLights} />
        <TrafficLight x={cx + 52} y={cy} rotation={90} active={signals.east} visible={showLights} />
        <TrafficLight x={cx - 52} y={cy} rotation={-90} active={signals.west} visible={showLights} />
      </svg>

      {showAmbulance && (
        <motion.div
          className="absolute flex h-7 w-7 items-center justify-center text-lg"
          style={{ marginLeft: -14, marginTop: -14 }}
          initial={{ left: "5%", top: "50%" }}
          animate={{ left: "42%", top: "50%" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <span style={{ filter: "drop-shadow(0 0 12px rgba(239,68,68,0.8))" }}>🚑</span>
        </motion.div>
      )}

      {showVehicles && (
        <>
          <VehicleOverlay
            emoji="🚗"
            from={{ x: 188, y: 20 }}
            to={{ x: 188, y: 140 }}
            delay={0.2}
            duration={2}
            paused={signals.north !== "green"}
          />
          <VehicleOverlay
            emoji="🚙"
            from={{ x: 188, y: 360 }}
            to={{ x: 188, y: 260 }}
            delay={0.5}
            duration={2.2}
            paused={signals.south !== "green"}
          />
          <VehicleOverlay
            emoji="🚕"
            from={{ x: 360, y: 188 }}
            to={{ x: 260, y: 188 }}
            delay={0.8}
            duration={2.4}
            paused={signals.east !== "green"}
          />
        </>
      )}
    </motion.div>
  );
}
