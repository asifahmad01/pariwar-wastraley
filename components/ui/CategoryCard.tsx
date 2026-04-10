"use client";

import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: string;
  /** Used for accessibility only (e.g. Hindi name) */
  labelHint?: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

export default function CategoryCard({
  category,
  labelHint,
  count,
  isActive,
  onClick,
}: CategoryCardProps) {
  const aria =
    labelHint && labelHint !== category
      ? `Filter by ${category}, ${labelHint}, ${count} items`
      : `Filter by ${category}, ${count} items`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={aria}
      className={cn(
        "inline-flex shrink-0 snap-start items-center gap-2 rounded-full border px-4 py-2.5 text-left transition-all duration-200",
        "min-h-[44px] max-w-[min(100%,18rem)] sm:min-h-[40px]",
        "active:scale-[0.98]",
        isActive
          ? "border-transparent bg-maroon-gradient text-cream shadow-md ring-2 ring-gold-400/50"
          : "border-maroon-900/15 bg-white text-maroon-900 shadow-sm hover:border-gold-500/40 hover:bg-cream-100"
      )}
    >
      <span className="truncate font-display text-sm font-semibold leading-none">{category}</span>
      <span
        className={cn(
          "inline-flex min-w-[1.5rem] shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold tabular-nums",
          isActive ? "bg-white/20 text-cream" : "bg-cream-300 text-maroon-800"
        )}
      >
        {count}
      </span>
    </button>
  );
}
