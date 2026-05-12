"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Music2, Tag } from "lucide-react";
import Image from "next/image";
import type { MusicEvent } from "@/lib/events";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string) {
  return dateFormatter.format(new Date(`${iso}T00:00:00`));
}

function formatTime(time: string) {
  const [hRaw, m] = time.split(":");
  const h = Number(hRaw);
  const period = h >= 12 ? "PM" : "AM";
  const display = ((h + 11) % 12) + 1;
  return `${display}:${m} ${period}`;
}

export function EventCard({
  event,
  index,
}: {
  event: MusicEvent;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-bg-card/70 p-4 transition-all duration-300 hover:border-accent-500/30 hover:shadow-glow sm:p-5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(60% 80% at 0% 0%, rgba(139,92,246,0.10), transparent 60%)",
        }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
        <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28 md:h-32 md:w-32">
          <Image
            src={event.image}
            alt={event.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, 128px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-white">
                {event.name}
              </h3>
              <p className="mt-1 line-clamp-1 text-sm text-white/55">
                {event.description}
              </p>
            </div>
          </div>

          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <InfoRow icon={<MapPin size={14} />} label="Location">
              {event.city}
            </InfoRow>
            <InfoRow icon={<Music2 size={14} />} label="Venue">
              {event.venue}
            </InfoRow>
            <InfoRow icon={<Tag size={14} />} label="Category">
              {event.category}
            </InfoRow>
          </dl>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-white/5 pt-3 text-xs text-white/55">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-accent-400" />
              {formatDate(event.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} className="text-accent-400" />
              {formatTime(event.time)}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/40">
        <span className="text-accent-400/80">{icon}</span>
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-white/85">{children}</dd>
    </div>
  );
}
