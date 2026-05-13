"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Plus, X } from "lucide-react";
import { EventFormModal } from "./EventFormModal";

const links = [
  { href: "#home", label: "Home" },
  { href: "#events", label: "Events" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openCreate() {
    setOpen(false);
    setCreateOpen(true);
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="glass border-b border-white/5">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
        >
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
            <li className="ml-2">
              <button
                type="button"
                onClick={openCreate}
                className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-accent-gradient px-3.5 py-2 text-sm font-medium text-white shadow-glow transition-opacity hover:opacity-95"
              >
                <Plus size={14} />
                Create Event
              </button>
            </li>
          </ul>

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
              <li>
                <button
                  type="button"
                  onClick={openCreate}
                  className="focus-ring mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-accent-gradient px-3 py-3 text-sm font-medium text-white shadow-glow transition-opacity hover:opacity-95"
                >
                  <Plus size={14} />
                  Create Event
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <EventFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </header>
  );
}
