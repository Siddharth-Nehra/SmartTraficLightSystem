import { useEffect, useRef } from "react";

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume = 0.03,
  type: OscillatorType = "sine"
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function useIntroSounds(phase: number) {
  const ctxRef = useRef<AudioContext | null>(null);
  const playedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    try {
      ctxRef.current = new AudioContext();
    } catch {
      // Audio not available
    }
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || playedRef.current.has(phase)) return;
    playedRef.current.add(phase);

    const resume = ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
    resume.then(() => {
      switch (phase) {
        case 0:
          playTone(ctx, 220, 0.4, 0.025);
          playTone(ctx, 440, 0.6, 0.015, "triangle");
          break;
        case 2:
          playTone(ctx, 800, 0.08, 0.02, "square");
          break;
        case 3:
          playTone(ctx, 660, 0.12, 0.025, "square");
          setTimeout(() => playTone(ctx, 880, 0.15, 0.02, "square"), 120);
          break;
        case 4:
          playTone(ctx, 330, 0.2, 0.02);
          break;
        case 5:
          playTone(ctx, 523, 0.5, 0.02, "triangle");
          break;
      }
    });
  }, [phase]);
}
