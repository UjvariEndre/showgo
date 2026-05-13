"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Lock, Mail, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useForm, type FieldError, type Resolver } from "react-hook-form";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import {
  signinSchema,
  signupSchema,
  type AuthFormValues,
  type AuthMode,
} from "@/models/auth";

const COPY: Record<
  AuthMode,
  { eyebrow: string; title: string; submit: string; busy: string; switchPrompt: string; switchLabel: string }
> = {
  signin: {
    eyebrow: "Welcome back",
    title: "Sign in",
    submit: "Sign In",
    busy: "Signing in…",
    switchPrompt: "Don't have an account?",
    switchLabel: "Join now",
  },
  signup: {
    eyebrow: "Get started",
    title: "Join ShowGo",
    submit: "Create Account",
    busy: "Creating…",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
  },
};

export function AuthModal({
  open,
  mode,
  onClose,
  onSwitchMode,
}: {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: (next: AuthMode) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const copy = COPY[mode];

  const resolver = useMemo<Resolver<AuthFormValues>>(
    () =>
      zodResolver(
        mode === "signup" ? signupSchema : signinSchema,
      ) as unknown as Resolver<AuthFormValues>,
    [mode],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<AuthFormValues>({
    resolver,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { name: "", email: "", password: "" },
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
    if (!open) {
      reset();
      setError(null);
    }
  }, [open, reset]);

  useEffect(() => {
    reset();
    setError(null);
  }, [mode, reset]);

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const supabase = getSupabaseBrowser();

      if (mode === "signin") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (authError) {
          setError(authError.message);
          return;
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { data: { name: values.name } },
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        // Supabase only returns a session here if email confirmation is OFF
        // in the project config. We auto-confirm via DB trigger, so when no
        // session comes back, the password sign-in below will succeed.
        if (!data.session) {
          const { error: signInError } =
            await supabase.auth.signInWithPassword({
              email: values.email,
              password: values.password,
            });
          if (signInError) {
            setError(signInError.message);
            return;
          }
        }
      }

      onClose();
      router.refresh();
    });
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="auth-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close authentication"
            onClick={() => !pending && onClose()}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-bg-card shadow-glow-lg"
          >
            <div className="relative flex items-center justify-between border-b border-white/5 px-6 py-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent-400/80">
                  {copy.eyebrow}
                </p>
                <h2
                  id="auth-modal-title"
                  className="mt-1 text-2xl font-semibold tracking-tight text-white"
                >
                  {copy.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                aria-label="Close"
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 transition-colors hover:bg-black/70 hover:text-white disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={onSubmit} noValidate className="px-6 py-6">
              <div className="space-y-4">
                {mode === "signup" && (
                  <AuthField
                    label="Name"
                    icon={<UserRound size={14} />}
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    error={errors.name}
                    {...register("name")}
                  />
                )}
                <AuthField
                  label="Email"
                  icon={<Mail size={14} />}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  error={errors.email}
                  {...register("email")}
                />
                <AuthField
                  label="Password"
                  icon={<Lock size={14} />}
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="At least 8 characters"
                  error={errors.password}
                  {...register("password")}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending || !isValid}
                className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending && <Loader2 size={14} className="animate-spin" />}
                {pending ? copy.busy : copy.submit}
              </button>

              <p className="mt-4 text-center text-xs text-white/55">
                {copy.switchPrompt}{" "}
                <button
                  type="button"
                  onClick={() =>
                    onSwitchMode(mode === "signin" ? "signup" : "signin")
                  }
                  disabled={pending}
                  className="focus-ring rounded font-medium text-accent-400 transition-colors hover:text-accent-50 disabled:opacity-50"
                >
                  {copy.switchLabel}
                </button>
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AuthFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  icon: React.ReactNode;
  error?: FieldError;
}

const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, icon, error, ...rest },
  ref,
) {
  const id = useId();
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/55">
          {label}
        </span>
        {error && (
          <span className="text-[11px] text-red-300" role="alert">
            {error.message}
          </span>
        )}
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
          {icon}
        </span>
        <input
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          className="focus-ring w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 transition-colors hover:border-white/20 focus:border-accent-400/50 aria-[invalid=true]:border-red-500/60"
          {...rest}
        />
      </div>
    </label>
  );
});
