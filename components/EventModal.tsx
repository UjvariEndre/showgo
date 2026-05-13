"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Clock, MapPin, Music2, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import type { MusicEvent } from "@/lib/events";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
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

export function EventModal({
  event,
  onClose,
}: {
  event: MusicEvent | null;
  onClose: () => void;
}) {
  const open = event !== null;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key="event-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close event details"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-bg-card shadow-glow-lg"
          >
            <div className="relative h-56 w-full overflow-hidden sm:h-64">
              <Image
                src={event.image}
                alt={event.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover"
                priority
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(16,16,25,0.10) 0%, rgba(16,16,25,0.55) 65%, #101019 100%)",
                }}
              />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close event details"
                className="focus-ring absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white/80 backdrop-blur-md transition-colors hover:bg-black/80 hover:text-white"
              >
                <X size={16} />
              </button>

              <span className="absolute bottom-4 left-5 inline-flex items-center gap-1.5 rounded-full border border-accent-400/30 bg-accent-500/15 px-3 py-1 text-xs font-medium text-accent-50 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                {event.category}
              </span>
            </div>

            <div className="max-h-[calc(90vh-14rem)] overflow-y-auto px-5 pb-6 pt-5 sm:max-h-[calc(90vh-16rem)] sm:px-7 sm:pb-7">
              <h2
                id="event-modal-title"
                className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
              >
                {event.name}
              </h2>
              <p className="mt-2 text-sm text-white/55">{event.description}</p>

              <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoBlock icon={<Calendar size={14} />} label="Date">
                  {formatDate(event.date)}
                </InfoBlock>
                <InfoBlock icon={<Clock size={14} />} label="Time">
                  {formatTime(event.time)}
                </InfoBlock>
                <InfoBlock icon={<MapPin size={14} />} label="Location">
                  {event.city}
                </InfoBlock>
                <InfoBlock icon={<Music2 size={14} />} label="Venue">
                  {event.venue}
                </InfoBlock>
                <InfoBlock
                  icon={<User size={14} />}
                  label="Organizer"
                  className="sm:col-span-2"
                >
                  {event.organizer}
                </InfoBlock>
              </dl>

              <section className="mt-6 border-t border-white/5 pt-5">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent-400/80">
                  About This Event
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {event.about}
                </p>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoBlock({
  icon,
  label,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/5 bg-white/[0.02] p-3.5 ${className}`}
    >
      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/40">
        <span className="text-accent-400">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-sm text-white">{children}</dd>
    </div>
  );
}
