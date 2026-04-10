"use client";

import { useEffect } from "react";

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Overlay + panel for filter controls (used from a "Filter" button on the storefront).
 */
export default function FilterModal({ open, onClose, title = "Filters", children }: FilterModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-maroon-950/50 backdrop-blur-sm"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-md flex-col rounded-t-3xl bg-cream shadow-card-hover sm:max-h-[85vh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gold-500/20 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:py-4">
          <h2 id="filter-modal-title" className="font-display text-lg font-semibold text-maroon-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full px-3 text-sm font-semibold text-maroon-800 hover:bg-maroon-900/10"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-2 sm:px-5">{children}</div>
        <div className="shrink-0 border-t border-gold-500/20 bg-white/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-5">
          <button type="button" onClick={onClose} className="btn-gold min-h-[48px] w-full justify-center sm:min-h-0">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
