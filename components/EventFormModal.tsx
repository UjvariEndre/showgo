"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { Controller, useForm, type FieldError } from "react-hook-form";
import type { User } from "@supabase/supabase-js";
import { createEvent, updateEvent, uploadImage } from "@/app/actions";
import { EVENT_IMAGES } from "@/lib/event-images";
import type { MusicEvent } from "@/lib/events";
import { displayNameOf } from "@/lib/user";
import {
  EVENT_GENRES,
  eventFormSchema,
  type EventFormValues,
} from "@/models/event";

const ACCEPTED_MIMES = "image/jpeg,image/png,image/webp";

function emptyValues(user: User): EventFormValues {
  return {
    title: "",
    description: "",
    genre: undefined as unknown as EventFormValues["genre"],
    date: "",
    time: "",
    location: "",
    venue: "",
    organizer: displayNameOf(user),
    about: "",
    image_url: "",
  };
}

function eventToValues(event: MusicEvent): EventFormValues {
  return {
    title: event.name,
    description: event.description,
    genre: event.category,
    date: event.date,
    time: event.time.slice(0, 5),
    location: event.city,
    venue: event.venue,
    organizer: event.organizer,
    about: event.about,
    image_url: event.image,
  };
}

const inputClasses =
  "focus-ring w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors hover:border-white/20 focus:border-accent-400/50 aria-[invalid=true]:border-red-500/60";

export function EventFormModal({
  open,
  onClose,
  event,
  user,
}: {
  open: boolean;
  onClose: () => void;
  /** When present, the form is in edit mode and submits an update for this event. */
  event?: MusicEvent | null;
  /** Used to auto-fill organizer on create; required since only authed users can open the form. */
  user: User;
}) {
  const isEdit = !!event;
  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: emptyValues(user),
  });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, pending]);

  useEffect(() => {
    if (open) {
      reset(event ? eventToValues(event) : emptyValues(user));
      setSubmitError(null);
    } else {
      setSubmitError(null);
    }
  }, [open, event, user, reset]);

  const onSubmit = handleSubmit((values) => {
    setSubmitError(null);
    startTransition(async () => {
      const result = event
        ? await updateEvent(event.id, values)
        : await createEvent(values);
      if (result.ok) {
        onClose();
        return;
      }
      if (result.fieldErrors) {
        for (const [key, message] of Object.entries(result.fieldErrors)) {
          setError(key as keyof EventFormValues, { type: "server", message });
        }
      }
      setSubmitError(result.error);
    });
  });

  const busy = pending || isSubmitting;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="event-form-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-form-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close form"
            onClick={() => !busy && onClose()}
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
                  {isEdit ? "Edit event" : "New event"}
                </p>
                <h2
                  id="event-form-title"
                  className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl"
                >
                  {isEdit ? "Edit event details" : "Create an event"}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                aria-label="Close form"
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 transition-colors hover:bg-black/70 hover:text-white disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={onSubmit}
              noValidate
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 overflow-y-auto px-5 pb-5 pt-5 sm:px-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Title"
                    colSpan={2}
                    placeholder="Sunset Rooftop Sessions"
                    error={errors.title}
                    {...register("title")}
                  />
                  <Field
                    label="Description"
                    colSpan={2}
                    placeholder="Short one-liner shown on the card"
                    error={errors.description}
                    {...register("description")}
                  />

                  <div className="sm:col-span-2">
                    <Controller
                      control={control}
                      name="genre"
                      render={({ field, fieldState }) => (
                        <GenreSelect
                          value={field.value}
                          onChange={(v) => {
                            field.onChange(v);
                            field.onBlur();
                          }}
                          options={EVENT_GENRES}
                          error={fieldState.error}
                        />
                      )}
                    />
                  </div>

                  <Field
                    label="Date"
                    type="date"
                    error={errors.date}
                    {...register("date")}
                  />
                  <Field
                    label="Time"
                    type="time"
                    error={errors.time}
                    {...register("time")}
                  />

                  <Field
                    label="Location (city)"
                    placeholder="Los Angeles"
                    error={errors.location}
                    {...register("location")}
                  />
                  <Field
                    label="Venue"
                    placeholder="The Wiltern"
                    error={errors.venue}
                    {...register("venue")}
                  />

                  <div className="sm:col-span-2">
                    <Controller
                      control={control}
                      name="image_url"
                      render={({ field }) => (
                        <ImagePicker
                          value={field.value}
                          onChange={(url) => {
                            field.onChange(url);
                            field.onBlur();
                          }}
                          error={errors.image_url}
                        />
                      )}
                    />
                  </div>

                  <TextareaField
                    label="About this event"
                    colSpan={2}
                    placeholder="The long-form details shown in the event modal."
                    error={errors.about}
                    {...register("about")}
                  />
                </div>

                {submitError && (
                  <p
                    role="alert"
                    className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200"
                  >
                    {submitError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/5 bg-bg-card/80 px-5 py-4 sm:px-7">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  className="focus-ring rounded-lg px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !isValid}
                  className="focus-ring inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-4 py-2 text-sm font-medium text-white shadow-glow transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy && <Loader2 size={14} className="animate-spin" />}
                  {busy
                    ? isEdit
                      ? "Saving…"
                      : "Creating…"
                    : isEdit
                    ? "Save changes"
                    : "Create Event"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FieldBaseProps {
  label: string;
  error?: FieldError;
  colSpan?: 1 | 2;
}

interface FieldProps
  extends FieldBaseProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {}

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, colSpan, ...rest },
  ref,
) {
  const id = useId();
  return (
    <label htmlFor={id} className={colSpan === 2 ? "sm:col-span-2" : ""}>
      <LabelText label={label} error={error} />
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={inputClasses}
        {...rest}
      />
      <ErrorText error={error} />
    </label>
  );
});

interface TextareaProps
  extends FieldBaseProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {}

const TextareaField = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function TextareaField({ label, error, colSpan, ...rest }, ref) {
    const id = useId();
    return (
      <label htmlFor={id} className={colSpan === 2 ? "sm:col-span-2" : ""}>
        <LabelText label={label} error={error} />
        <textarea
          id={id}
          ref={ref}
          rows={4}
          aria-invalid={error ? true : undefined}
          className={`${inputClasses} resize-y`}
          {...rest}
        />
        <ErrorText error={error} />
      </label>
    );
  },
);

function GenreSelect({
  value,
  onChange,
  options,
  error,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  options: readonly string[];
  error?: FieldError;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  return (
    <div>
      <LabelText label="Genre" error={error} />
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={error ? true : undefined}
          className={`focus-ring flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm transition-colors hover:border-white/20 aria-[invalid=true]:border-red-500/60 ${
            open ? "border-accent-400/50" : ""
          } ${value ? "text-white" : "text-white/40"}`}
        >
          <span className="truncate">{value || "Select a genre…"}</span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              ref={popoverRef}
              role="listbox"
              aria-label="Genre options"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-bg-card/95 p-1 shadow-glow-lg backdrop-blur-md"
            >
              {options.map((opt) => {
                const isSelected = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`focus-ring flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-accent-500/15 text-accent-50"
                        : "text-white/75 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && (
                      <Check size={14} className="shrink-0 text-accent-400" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LabelText({ label, error }: { label: string; error?: FieldError }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">
        {label}
        <span className="ml-1 text-accent-400">*</span>
      </span>
      {error && (
        <span className="text-[11px] text-red-300" role="alert">
          {error.message}
        </span>
      )}
    </span>
  );
}

function ErrorText({ error }: { error?: FieldError }) {
  if (!error) return null;
  return <span className="sr-only">{error.message}</span>;
}

function ImagePicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (url: string) => void;
  error?: FieldError;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const curatedMatch = EVENT_IMAGES.find((img) => img.url === value);
  const isCustomUpload = value && !curatedMatch;

  async function handleFile(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadImage(fd);
      if (result.ok) {
        onChange(result.url);
        setOpen(false);
      } else {
        setUploadError(result.error);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <LabelText label="Cover image" error={error} />
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={error ? true : undefined}
          className={`focus-ring flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-white transition-colors hover:border-white/20 aria-[invalid=true]:border-red-500/60 ${
            open ? "border-accent-400/50" : ""
          }`}
        >
          {curatedMatch ? (
            <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md">
              <Image
                src={curatedMatch.thumb}
                alt={curatedMatch.alt}
                fill
                sizes="56px"
                className="object-cover"
              />
            </span>
          ) : isCustomUpload ? (
            <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md">
              <Image
                src={value}
                alt="Uploaded cover"
                fill
                sizes="56px"
                className="object-cover"
              />
            </span>
          ) : (
            <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-white/15 text-white/40">
              <ImageIcon size={16} />
            </span>
          )}
          <span className="flex-1 truncate">
            {curatedMatch
              ? curatedMatch.alt
              : isCustomUpload
              ? "Your uploaded image"
              : "Pick a cover image…"}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_MIMES}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <AnimatePresence>
          {open && (
            <motion.div
              ref={popoverRef}
              role="listbox"
              aria-label="Cover image options"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="absolute left-0 right-0 z-20 mt-2 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-bg-card/95 p-2 shadow-glow-lg backdrop-blur-md"
            >
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {EVENT_IMAGES.map((img) => {
                  const isSelected = img.url === value;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(img.url);
                        setOpen(false);
                      }}
                      className={`focus-ring group relative aspect-square overflow-hidden rounded-md border transition-all ${
                        isSelected
                          ? "border-accent-400 ring-2 ring-accent-400/60"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <Image
                        src={img.thumb}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 640px) 25vw, 120px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isSelected && (
                        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-white shadow-glow">
                          <Check size={12} />
                        </span>
                      )}
                    </button>
                  );
                })}

                <button
                  type="button"
                  role="option"
                  aria-selected={!!isCustomUpload}
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className={`focus-ring group relative aspect-square overflow-hidden rounded-md border-2 border-dashed transition-all ${
                    isCustomUpload
                      ? "border-accent-400 ring-2 ring-accent-400/60"
                      : "border-white/15 hover:border-white/35"
                  } disabled:cursor-wait`}
                >
                  {isCustomUpload && !uploading ? (
                    <Image
                      src={value}
                      alt="Uploaded cover"
                      fill
                      sizes="(max-width: 640px) 25vw, 120px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full flex-col items-center justify-center gap-1 bg-white/[0.02] text-white/65">
                      {uploading ? (
                        <Loader2 size={18} className="animate-spin text-accent-400" />
                      ) : (
                        <Upload size={16} className="text-accent-400" />
                      )}
                      <span className="px-1 text-center text-[10px] font-medium uppercase tracking-wider">
                        {uploading ? "Uploading" : "Upload"}
                      </span>
                    </span>
                  )}
                  {isCustomUpload && !uploading && (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-white shadow-glow">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              </div>

              <p className="mt-2 px-1 pb-1 text-[11px] text-white/40">
                JPEG, PNG, or WebP · max 5 MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {uploadError && (
        <p role="alert" className="mt-1.5 text-[11px] text-red-300">
          {uploadError}
        </p>
      )}
    </div>
  );
}
