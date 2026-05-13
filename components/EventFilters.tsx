"use client";

import {
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarArrowDown,
  CalendarArrowUp,
  type LucideIcon,
} from "lucide-react";
import type { EventCategory } from "@/lib/events";

export type GenreFilter = "All" | EventCategory;

export const GENRE_FILTERS: GenreFilter[] = [
  "All",
  "Rock",
  "Jazz",
  "Electronic",
  "Indie",
  "Hip-Hop",
  "Classical",
];

export type SortKey = "date-asc" | "date-desc" | "name-asc" | "name-desc";

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "date-asc", label: "Date — soonest first" },
  { value: "date-desc", label: "Date — latest first" },
  { value: "name-asc", label: "Name — A to Z" },
  { value: "name-desc", label: "Name — Z to A" },
];

const SORT_ICONS: Record<SortKey, LucideIcon> = {
  "date-asc": CalendarArrowUp,
  "date-desc": CalendarArrowDown,
  "name-asc": ArrowDownAZ,
  "name-desc": ArrowUpAZ,
};

export function EventFilters({
  genre,
  onGenreChange,
  sort,
  onSortChange,
}: {
  genre: GenreFilter;
  onGenreChange: (g: GenreFilter) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
}) {
  const SortIcon = SORT_ICONS[sort];
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="radiogroup"
        aria-label="Filter by genre"
        className="-mx-1 flex flex-wrap items-center gap-1.5 px-1 sm:flex-nowrap sm:overflow-x-auto"
      >
        {GENRE_FILTERS.map((g) => {
          const active = g === genre;
          return (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onGenreChange(g)}
              className={`focus-ring shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-accent-400/50 bg-accent-500/15 text-accent-50"
                  : "border-white/10 bg-white/[0.02] text-white/65 hover:border-white/20 hover:text-white"
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      <label className="flex shrink-0 items-center gap-2 text-xs text-white/55">
        <SortIcon size={14} className="text-accent-400" />
        <span className="sr-only">Sort events</span>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="focus-ring appearance-none rounded-full border border-white/10 bg-white/[0.02] py-1.5 pl-3 pr-8 text-xs text-white transition-colors hover:border-white/20"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-bg-card">
                {o.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40"
          >
            ▾
          </span>
        </div>
      </label>
    </div>
  );
}
