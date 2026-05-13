"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthModal } from "./AuthModal";
import { EventFormModal } from "./EventFormModal";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { AuthMode } from "@/models/auth";

const links = [
  { href: "#home", label: "Home" },
  { href: "#events", label: "Events" },
];

function initialsOf(user: User) {
  const name = user.email ?? "?";
  return name.slice(0, 2).toUpperCase();
}

export function Navbar({ user }: { user: User | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [userMenuOpen]);

  function openCreate() {
    setOpen(false);
    setUserMenuOpen(false);
    setCreateOpen(true);
  }

  function openAuth(mode: AuthMode) {
    setOpen(false);
    setUserMenuOpen(false);
    setAuthMode(mode);
  }

  async function handleSignOut() {
    setUserMenuOpen(false);
    await getSupabaseBrowser().auth.signOut();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="glass border-b border-white/5">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6"
        >
          <div className="flex items-center gap-8">
            <a
              href="#home"
              className="focus-ring rounded-md text-lg font-semibold tracking-tight"
              aria-label="ShowGo home"
            >
              <span className="bg-accent-gradient bg-clip-text text-transparent">
                Show
              </span>
              <span className="text-white">Go</span>
            </a>

            <ul className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="focus-ring rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={openCreate}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-accent-400/40 bg-accent-500/10 px-3.5 py-1.5 text-sm font-medium text-accent-50 transition-colors hover:border-accent-400/60 hover:bg-accent-500/20"
                >
                  <Plus size={14} />
                  Create Event
                </button>

                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    aria-label="Account menu"
                    className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-accent-gradient text-xs font-semibold tracking-wider text-white shadow-glow transition-opacity hover:opacity-90"
                  >
                    {initialsOf(user)}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.14, ease: "easeOut" }}
                        className="absolute right-0 top-12 z-30 w-60 overflow-hidden rounded-xl border border-white/10 bg-bg-card/95 shadow-glow-lg backdrop-blur-md"
                      >
                        <div className="border-b border-white/5 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                            Signed in as
                          </p>
                          <p className="mt-0.5 truncate text-sm text-white">
                            {user.email}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          role="menuitem"
                          className="focus-ring flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <LogOut size={14} />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuth("signin")}
                  className="focus-ring rounded-full px-3.5 py-1.5 text-sm font-medium text-white/75 transition-colors hover:text-white"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("signup")}
                  className="focus-ring inline-flex items-center rounded-full bg-accent-gradient px-4 py-1.5 text-sm font-semibold text-white shadow-glow transition-opacity hover:opacity-95"
                >
                  Join Now
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-md text-white/80 hover:bg-white/5 hover:text-white md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="glass border-b border-white/5 md:hidden"
          >
            <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="focus-ring block rounded-md px-3 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}

              {user ? (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={openCreate}
                      className="focus-ring mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-accent-400/40 bg-accent-500/10 px-3 py-3 text-sm font-medium text-accent-50 transition-colors hover:border-accent-400/60 hover:bg-accent-500/20"
                    >
                      <Plus size={14} />
                      Create Event
                    </button>
                  </li>
                  <li className="mt-2 border-t border-white/5 pt-3">
                    <p className="px-3 text-[10px] uppercase tracking-[0.18em] text-white/40">
                      Signed in as
                    </p>
                    <p className="truncate px-3 pb-2 pt-0.5 text-sm text-white">
                      {user.email}
                    </p>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="focus-ring flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="mt-1">
                    <button
                      type="button"
                      onClick={() => openAuth("signin")}
                      className="focus-ring flex w-full items-center justify-center rounded-md border border-white/10 px-3 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      Sign In
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openAuth("signup")}
                      className="focus-ring flex w-full items-center justify-center rounded-md bg-accent-gradient px-3 py-3 text-sm font-semibold text-white shadow-glow transition-opacity hover:opacity-95"
                    >
                      Join Now
                    </button>
                  </li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <EventFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <AuthModal
        open={authMode !== null}
        mode={authMode ?? "signin"}
        onClose={() => setAuthMode(null)}
        onSwitchMode={(next) => setAuthMode(next)}
      />
    </header>
  );
}
