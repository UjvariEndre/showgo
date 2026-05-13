"use client";

import { useState } from "react";
import type { MusicEvent } from "@/lib/events";
import { EventCard } from "./EventCard";
import { EventModal } from "./EventModal";

export function EventList({ events }: { events: MusicEvent[] }) {
  const [selected, setSelected] = useState<MusicEvent | null>(null);

  return (
    <section
      id="events"
      aria-label="Upcoming events"
      className="mx-auto max-w-4xl px-6 py-16 sm:py-24"
    >
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent-400/80">
            Upcoming
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Tonight&apos;s lineup
          </h2>
        </div>
        <span className="hidden text-sm text-white/40 sm:block">
          {events.length} events
        </span>
      </header>

      <ul className="flex flex-col gap-4">
        {events.map((event, i) => (
          <li key={event.id}>
            <EventCard
              event={event}
              index={i}
              onSelect={() => setSelected(event)}
            />
          </li>
        ))}
      </ul>

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
