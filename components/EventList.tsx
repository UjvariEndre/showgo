"use client";

import { useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { MusicEvent } from "@/lib/events";
import { EventCard } from "./EventCard";
import { EventFilters, type GenreFilter, type SortKey } from "./EventFilters";
import { EventFormModal } from "./EventFormModal";
import { EventModal } from "./EventModal";

export function EventList({
  events,
  user,
}: {
  events: MusicEvent[];
  user: User | null;
}) {
  const [selected, setSelected] = useState<MusicEvent | null>(null);
  const [editing, setEditing] = useState<MusicEvent | null>(null);
  const [genre, setGenre] = useState<GenreFilter>("All");
  const [sort, setSort] = useState<SortKey>("date-asc");

  const visible = useMemo(() => {
    const filtered =
      genre === "All" ? events : events.filter((e) => e.category === genre);
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return a.date.localeCompare(b.date);
        case "date-desc":
          return b.date.localeCompare(a.date);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
      }
    });
    return sorted;
  }, [events, genre, sort]);

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
          {visible.length} {visible.length === 1 ? "event" : "events"}
        </span>
      </header>

      <EventFilters
        genre={genre}
        onGenreChange={setGenre}
        sort={sort}
        onSortChange={setSort}
      />

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
          <p className="text-sm text-white/55">
            No events match the current filters.
          </p>
          {genre !== "All" && (
            <button
              type="button"
              onClick={() => setGenre("All")}
              className="focus-ring mt-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/75 transition-colors hover:border-white/20 hover:text-white"
            >
              Clear genre filter
            </button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((event, i) => (
            <li key={event.id}>
              <EventCard
                event={event}
                index={i}
                onSelect={() => setSelected(event)}
              />
            </li>
          ))}
        </ul>
      )}

      <EventModal
        event={selected}
        onClose={() => setSelected(null)}
        onEdit={
          user
            ? (event) => {
                setSelected(null);
                setEditing(event);
              }
            : undefined
        }
        canDelete={!!user}
      />

      {user && (
        <EventFormModal
          open={editing !== null}
          event={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}
