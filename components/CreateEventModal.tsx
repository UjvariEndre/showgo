"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { forwardRef, useEffect, useRef, useState, useTransition } from "react";
import { createEvent } from "@/app/actions";

const GENRES = [
  "Rock",
  "Jazz",
  "Electronic",
  "Indie",
  "Hip-Hop",
  "Classical",
] as const;

export function CreateEventModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    firstFieldRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, pending]);

  useEffect(() => {
    if (!open) setError(null);
  }, [open]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createEvent(data);
      if (result.ok) {
        formRef.current?.reset();
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="create-event-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-event-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close create event form"
            onClick={() => !pending && onClose()}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-bg-card shadow-glow-lg"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 sm:px-7">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent-400/80">
                  New event
                </p>
                <h2
                  id="create-event-title"
                  className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl"
                >
                  Create an event
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                aria-label="Close create event form"
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 transition-colors hover:bg-black/70 hover:text-white disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 overflow-y-auto px-5 pb-5 pt-5 sm:px-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Title" name="title" required colSpan={2} ref={firstFieldRef} placeholder="Sunset Rooftop Sessions" />
                  <Field label="Description" name="description" required colSpan={2} placeholder="Short one-liner shown on the card" />

                  <SelectField label="Genre" name="genre" required options={GENRES} />
                  <Field label="Organizer" name="organizer" required placeholder="Goldenvoice" />

                  <Field label="Date" name="date" type="date" required />
                  <Field label="Time" name="time" type="time" required />

                  <Field label="Location (city)" name="location" required placeholder="Los Angeles" />
                  <Field label="Venue" name="venue" required placeholder="The Wiltern" />

                  <Field label="Image URL" name="image_url" type="url" required colSpan={2} placeholder="https://images.unsplash.com/..." />

                  <TextareaField label="About this event" name="about" required colSpan={2} placeholder="The long-form details shown in the event modal." />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200"
                  >
                    {error}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/5 bg-bg-card/80 px-5 py-4 sm:px-7">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={pending}
                  className="focus-ring rounded-lg px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="focus-ring inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-4 py-2 text-sm font-medium text-white shadow-glow transition-opacity hover:opacity-95 disabled:opacity-60"
                >
                  {pending && <Loader2 size={14} className="animate-spin" />}
                  {pending ? "Creating…" : "Create Event"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  colSpan?: 1 | 2;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, name, type = "text", required, placeholder, colSpan },
  ref,
) {
  return (
    <label className={colSpan === 2 ? "sm:col-span-2" : ""}>
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/50">
        {label}
        {required && <span className="ml-1 text-accent-400">*</span>}
      </span>
      <input
        ref={ref}
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="focus-ring w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors hover:border-white/20 focus:border-accent-400/50"
      />
    </label>
  );
});

function TextareaField({
  label,
  name,
  required,
  placeholder,
  colSpan,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  colSpan?: 1 | 2;
}) {
  return (
    <label className={colSpan === 2 ? "sm:col-span-2" : ""}>
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/50">
        {label}
        {required && <span className="ml-1 text-accent-400">*</span>}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={4}
        className="focus-ring w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors hover:border-white/20 focus:border-accent-400/50"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  required,
  options,
  colSpan,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: readonly string[];
  colSpan?: 1 | 2;
}) {
  return (
    <label className={colSpan === 2 ? "sm:col-span-2" : ""}>
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/50">
        {label}
        {required && <span className="ml-1 text-accent-400">*</span>}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="focus-ring w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white transition-colors hover:border-white/20 focus:border-accent-400/50"
      >
        <option value="" disabled className="bg-bg-card">
          Select a genre…
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-bg-card">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
