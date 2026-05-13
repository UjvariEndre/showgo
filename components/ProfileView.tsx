"use client";

import { motion } from "framer-motion";
import { CalendarPlus, Plus, Tag, Wand2, type LucideIcon } from "lucide-react";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { MusicEvent } from "@/lib/events";
import { initialsOf, nameOf } from "@/lib/user";
import { EventCard } from "./EventCard";
import { EventFormModal } from "./EventFormModal";
import { EventModal } from "./EventModal";

type Tab = "attending" | "created";

const TABS: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
  { id: "attending", label: "Attending", icon: Tag },
  { id: "created", label: "Created", icon: Wand2 },
];

export function ProfileView({
  user,
  attending,
  created,
  attendingIds,
}: {
  user: User;
  attending: MusicEvent[];
  created: MusicEvent[];
  attendingIds: Set<string>;
}) {
  const [tab, setTab] = useState<Tab>("attending");
  const [selected, setSelected] = useState<MusicEvent | null>(null);
  const [editing, setEditing] = useState<MusicEvent | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const events = tab === "attending" ? attending : created;
  const name = nameOf(user);
  const formOpen = editing !== null || createOpen;

  return (
    <section
      aria-label="Profile"
      className="mx-auto max-w-4xl px-6 py-16 sm:py-20"
    >
      <header className="mb-8 flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-base font-semibold tracking-wider text-white shadow-glow">
          {initialsOf(user)}
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-400/80">
            Your profile
          </p>
          {name && (
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {name}
            </h1>
          )}
          <p
            className={`truncate ${
              name ? "mt-1 text-sm text-white/55" : "mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            }`}
          >
            {user.email}
          </p>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Profile sections"
        className="relative mb-8 flex gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          const count = id === "attending" ? attending.length : created.length;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className="focus-ring relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              {active && (
                <motion.span
                  layoutId="profile-tab-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-accent-gradient shadow-glow"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                />
              )}
              <Icon size={14} className={active ? "text-white" : "text-accent-400"} />
              <span className={active ? "text-white" : "text-white/70"}>
                {label}
              </span>
              <span
                className={`rounded-full px-1.5 text-[10px] font-semibold ${
                  active ? "bg-white/15 text-white" : "bg-white/[0.04] text-white/55"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {events.length === 0 ? (
        tab === "created" ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-400/30 bg-accent-500/10 text-accent-400 shadow-glow">
              <CalendarPlus size={24} />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-white">
              No Events Created Yet
            </h3>
            <p className="mt-2 max-w-sm text-sm text-white/55">
              You haven&apos;t created any events yet. Start by creating your
              first event!
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="focus-ring mt-6 inline-flex items-center gap-1.5 rounded-full bg-accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition-opacity hover:opacity-95"
            >
              <Plus size={14} />
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-sm text-white/55">
              You&apos;re not attending any events yet. Tap Attend on an event to join.
            </p>
          </div>
        )
      ) : (
        <ul className="flex flex-col gap-4">
          {events.map((event, i) => (
            <li key={event.id}>
              <EventCard
                event={event}
                index={i}
                onSelect={() => setSelected(event)}
                isOwner={event.createdBy === user.id}
                isAttending={attendingIds.has(event.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {(() => {
        const isSelectedOwner = !!(selected && selected.createdBy === user.id);
        return (
          <EventModal
            event={selected}
            onClose={() => setSelected(null)}
            onEdit={
              isSelectedOwner
                ? (event) => {
                    setSelected(null);
                    setEditing(event);
                  }
                : undefined
            }
            canDelete={isSelectedOwner}
            canAttend
            isAttending={selected ? attendingIds.has(selected.id) : false}
          />
        );
      })()}

      <EventFormModal
        open={formOpen}
        event={editing}
        onClose={() => {
          setEditing(null);
          setCreateOpen(false);
        }}
      />
    </section>
  );
}
