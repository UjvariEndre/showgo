"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Loader2,
  MapPin,
  Music2,
  Pencil,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { attendEvent, deleteEvent, leaveEvent } from "@/app/actions";
import { useBodyScrollLock } from "@/lib/body-lock";
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
  onEdit,
  canDelete = false,
  canAttend = false,
  isAttending = false,
  onJoinPrompt,
}: {
  event: MusicEvent | null;
  onClose: () => void;
  onEdit?: (event: MusicEvent) => void;
  canDelete?: boolean;
  canAttend?: boolean;
  isAttending?: boolean;
  /** When set (and canAttend is false), shows a "Join to attend" CTA that calls this handler. */
  onJoinPrompt?: () => void;
}) {
  const showJoin = !canAttend && !!onJoinPrompt;
  const showActions = canDelete || !!onEdit || canAttend || showJoin;
  const router = useRouter();
  const [attendPending, startAttendTransition] = useTransition();
  const [attendError, setAttendError] = useState<string | null>(null);
  const open = event !== null;
  const [confirming, setConfirming] = useState(false);
  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) {
      setConfirming(false);
      setDeleteError(null);
      setAttendError(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (confirming && !deletePending) {
        setConfirming(false);
      } else if (!deletePending) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, confirming, deletePending]);

  function handleDelete() {
    if (!event) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteEvent(event.id);
      if (result.ok) {
        setConfirming(false);
        onClose();
      } else {
        setDeleteError(result.error);
      }
    });
  }

  function handleAttendToggle() {
    if (!event) return;
    setAttendError(null);
    startAttendTransition(async () => {
      const result = isAttending
        ? await leaveEvent(event.id)
        : await attendEvent(event.id);
      if (result.ok) {
        router.refresh();
      } else {
        setAttendError(result.error);
      }
    });
  }

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
            onClick={() => !deletePending && onClose()}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-bg-card shadow-glow-lg"
          >
            <div className="relative h-56 w-full shrink-0 overflow-hidden sm:h-64">
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
                disabled={deletePending}
                aria-label="Close event details"
                className="focus-ring absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white/80 backdrop-blur-md transition-colors hover:bg-black/80 hover:text-white disabled:opacity-50"
              >
                <X size={16} />
              </button>

              <span className="absolute bottom-4 left-5 inline-flex items-center gap-1.5 rounded-full border border-accent-400/30 bg-accent-500/15 px-3 py-1 text-xs font-medium text-accent-50 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                {event.category}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
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

            {showActions && (
              <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-white/5 bg-bg-card/80 px-5 py-3.5 sm:px-7">
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    disabled={deletePending || attendPending}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-200 transition-colors hover:border-red-500/45 hover:bg-red-500/15 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(event)}
                    disabled={deletePending || attendPending}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:border-white/25 hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                )}
                {canAttend && (
                  <div className="ml-auto flex flex-col items-end gap-1">
                    <button
                      type="button"
                      onClick={handleAttendToggle}
                      disabled={deletePending || attendPending}
                      className={`focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold shadow-glow transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-60 ${
                        isAttending
                          ? "border border-accent-400/40 bg-accent-500/15 text-accent-50"
                          : "bg-accent-gradient text-white"
                      }`}
                    >
                      {attendPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : isAttending ? (
                        <Check size={14} />
                      ) : (
                        <Tag size={14} />
                      )}
                      {attendPending
                        ? isAttending
                          ? "Leaving…"
                          : "Joining…"
                        : isAttending
                        ? "Attending"
                        : "Attend"}
                    </button>
                    {attendError && (
                      <p role="alert" className="text-[11px] text-red-300">
                        {attendError}
                      </p>
                    )}
                  </div>
                )}
                {showJoin && (
                  <button
                    type="button"
                    onClick={onJoinPrompt}
                    className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded-lg bg-accent-gradient px-3.5 py-1.5 text-sm font-semibold text-white shadow-glow transition-opacity hover:opacity-95"
                  >
                    <Tag size={14} />
                    Join to attend
                  </button>
                )}
              </div>
            )}

            <AnimatePresence>
              {confirming && (
                <motion.div
                  key="confirm-delete"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 backdrop-blur-md"
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="confirm-delete-title"
                >
                  <motion.div
                    initial={{ y: 10, scale: 0.96, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 10, scale: 0.96, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mx-6 w-full max-w-sm rounded-xl border border-white/10 bg-bg-card p-5 shadow-glow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-300">
                        <AlertTriangle size={16} />
                      </span>
                      <div className="min-w-0">
                        <h3
                          id="confirm-delete-title"
                          className="text-base font-semibold text-white"
                        >
                          Delete this event?
                        </h3>
                        <p className="mt-1 text-sm text-white/60">
                          &ldquo;{event.name}&rdquo; will be permanently
                          removed. This cannot be undone.
                        </p>
                      </div>
                    </div>

                    {deleteError && (
                      <p
                        role="alert"
                        className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200"
                      >
                        {deleteError}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirming(false)}
                        disabled={deletePending}
                        className="focus-ring rounded-lg px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deletePending}
                        className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white shadow-glow transition-opacity hover:bg-red-500 disabled:cursor-wait disabled:opacity-70"
                      >
                        {deletePending && (
                          <Loader2 size={13} className="animate-spin" />
                        )}
                        {deletePending ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
