"use client";

import { useSyncExternalStore, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";

const DISCLAIMER_KEY = "safespace_disclaimer_dismissed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): boolean {
  return !localStorage.getItem(DISCLAIMER_KEY);
}

function getServerSnapshot(): boolean {
  return false; // Always hidden on server to match hydration
}

export function DisclaimerBanner() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISCLAIMER_KEY, "true");
    // Trigger a storage event so useSyncExternalStore re-reads
    window.dispatchEvent(new StorageEvent("storage", { key: DISCLAIMER_KEY }));
  }, []);

  if (!visible) return null;

  return (
    <div className="relative border-b border-safe-amber/20 bg-safe-amber/5">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-safe-amber" />
          <p className="flex-1 text-sm text-safe-amber/80">
            This is a <strong>peer support space</strong>, not professional
            therapy. If you&apos;re in crisis, call <strong>933</strong> (Lifeline Zambia) or contact a helpline.
          </p>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-md p-1 text-safe-amber/60 transition-colors hover:bg-safe-amber/10 hover:text-safe-amber"
            aria-label="Dismiss disclaimer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
