"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarArrowDown,
  CalendarArrowUp,
  Check,
  ChevronDown,
  ListFilter,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { EventCategory } from "@/lib/events";
import { EVENT_GENRES } from "@/models/event";

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
  selectedGenres,
  onSelectedGenresChange,
  sort,
  onSortChange,
}: {
  selectedGenres: Set<EventCategory>;
  onSelectedGenresChange: (next: Set<EventCategory>) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
}) {
  const SortIcon = SORT_ICONS[sort];
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <GenreMultiSelect
        selectedGenres={selectedGenres}
        onChange={onSelectedGenresChange}
      />

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

function GenreMultiSelect({
  selectedGenres,
  onChange,
}: {
  selectedGenres: Set<EventCategory>;
  onChange: (next: Set<EventCategory>) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const active = selectedGenres.size > 0;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle(genre: EventCategory) {
    const next = new Set(selectedGenres);
    if (next.has(genre)) next.delete(genre);
    else next.add(genre);
    onChange(next);
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`focus-ring inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
          active
            ? "border-accent-400/50 bg-accent-500/15 text-accent-50"
            : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:text-white"
        }`}
      >
        <ListFilter size={13} />
        Genre
        {active && (
          <span className="inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-accent-gradient px-1 text-[10px] font-semibold tabular-nums text-white shadow-glow">
            {selectedGenres.size}
          </span>
        )}
        <ChevronDown
          size={13}
          className={`text-current/60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popoverRef}
            role="listbox"
            aria-multiselectable="true"
            aria-label="Filter by genre"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute left-0 top-full z-20 mt-2 flex max-h-80 w-60 flex-col overflow-hidden rounded-xl border border-white/10 bg-bg-card/95 shadow-glow-lg backdrop-blur-md"
          >
            <div className="flex-1 overflow-y-auto p-1">
              {EVENT_GENRES.map((genre) => {
                const isSelected = selectedGenres.has(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggle(genre)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-accent-500/15 text-accent-50"
                        : "text-white/75 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        isSelected
                          ? "border-accent-400 bg-accent-500"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check size={11} className="text-white" />}
                    </span>
                    <span className="truncate">{genre}</span>
                  </button>
                );
              })}
            </div>
            {active && (
              <button
                type="button"
                onClick={() => onChange(new Set())}
                className="focus-ring border-t border-white/5 px-4 py-2.5 text-left text-xs font-medium text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                Clear all ({selectedGenres.size})
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
