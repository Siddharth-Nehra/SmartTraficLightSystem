/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          950: "#030712",
          900: "#0a0f1a",
          800: "#0f172a",
          700: "#1e293b",
          500: "#3b82f6",
          400: "#60a5fa",
          300: "#93c5fd",
          glow: "#38bdf8",
        },
      },
      fontFamily: {
        display: ["Orbitron", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(56, 189, 248, 0.35), 0 0 60px rgba(59, 130, 246, 0.15)",
        "neon-sm": "0 0 12px rgba(56, 189, 248, 0.5)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
