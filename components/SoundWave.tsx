"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Animated equalizer-style wave. Pure transform/opacity animation
 * so the GPU handles it — no layout reads, no JS-driven per-frame work.
 */
export function SoundWave({
  bars = 56,
  className = "",
}: {
  bars?: number;
  className?: string;
}) {
  const items = useMemo(() => {
    return Array.from({ length: bars }, (_, i) => {
      // Bell curve so the middle bars are tallest
      const t = i / (bars - 1);
      const bell = Math.sin(Math.PI * t);
      const baseScale = 0.25 + bell * 0.85;
      const peakScale = 0.5 + bell * 1.15 + Math.random() * 0.15;
      const duration = 1.1 + Math.random() * 1.2;
      const delay = -Math.random() * duration;
      return { i, baseScale, peakScale, duration, delay };
    });
  }, [bars]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none flex h-40 w-full items-center justify-center gap-[3px] sm:h-48 ${className}`}
    >
      {items.map((b) => (
        <motion.span
          key={b.i}
          className="block w-[3px] rounded-full bg-accent-gradient sm:w-[4px]"
          style={{
            height: "60%",
            transformOrigin: "center",
            willChange: "transform, opacity",
            filter: "drop-shadow(0 0 6px rgba(168, 85, 247, 0.45))",
          }}
          initial={{ scaleY: b.baseScale, opacity: 0.45 }}
          animate={{
            scaleY: [b.baseScale, b.peakScale, b.baseScale],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}
