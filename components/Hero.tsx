"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SoundWave } from "./SoundWave";

export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden"
      aria-label="ShowGo intro"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-fade" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-[120%] -translate-x-1/2 rounded-[100%] bg-accent-500/10 blur-3xl"
      />

      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-16 pt-24 text-center sm:pb-24 sm:pt-32">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/70"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" />
          Live music, near you
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance text-5xl font-semibold tracking-tightest text-white sm:text-6xl md:text-7xl"
        >
          Discover Music Events
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-5 max-w-xl text-balance text-base text-white/60 sm:text-lg"
        >
          Concerts, club nights, and small-room shows — curated for the way you
          actually listen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleY: 0.6 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 w-full max-w-3xl origin-center"
        >
          <SoundWave />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8"
        >
          <a
            href="#events"
            className="focus-ring group inline-flex items-center gap-2 rounded-full bg-accent-gradient px-6 py-3 text-sm font-medium text-white shadow-glow transition-all duration-300 hover:shadow-glow-lg hover:brightness-110"
          >
            Join the movement
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
