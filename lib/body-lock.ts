"use client";

import { useEffect } from "react";

// Module-level reference counter: multiple modals can stack the lock and the
// underlying body.overflow only gets restored when the last one releases it.
// Without this, two modals each capturing their own "prev" value would race —
// whichever cleanup runs second would clobber the first's restore.
let lockCount = 0;
let originalOverflow: string | null = null;

function lock() {
  if (lockCount === 0 && typeof document !== "undefined") {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount++;
}

function unlock() {
  if (lockCount === 0) return;
  lockCount--;
  if (lockCount === 0 && typeof document !== "undefined") {
    document.body.style.overflow = originalOverflow ?? "";
    originalOverflow = null;
  }
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
