"use client";

import type { FilterState } from "@/types";
import { cn } from "@/lib/utils";

export interface FilterBarProps {
  filters: FilterState;
  /** From deriveCategories — dynamic */
  categories: string[];
  styles: string[];
  sizes: string[];
  colorOptions: [string, string][];
  onCategory: (v: string) => void;
  onStyle: (v: string) => void;
  onSize: (v: string) => void;
  onColor: (v: string) => void;
  onSearch: (v: string) => void;
  onReset: () => void;
  hasActive: boolean;
  resultCount: number;
  /** e.g. plain style inside a modal */
  className?: string;
}

/**
 * Reusable filter panel: search + category, style, color, size (all data-driven).
 */
export default function FilterBar({
  filters,
  categories,
  styles,
  sizes,
  colorOptions,
  onCategory,
  onStyle,
  onSize,
  onColor,
  onSearch,
  onReset,
  hasActive,
  resultCount,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "space-y-5 rounded-2xl border border-gold-500/20 bg-white p-4 shadow-card sm:p-5",
        className
      )}
    >
      {/* Search — filters list in real time */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon-700/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          placeholder="Search by name, category, style…"
          value={filters.search}
          onChange={(e) => onSearch(e.target.value)}
          className="min-h-[48px] w-full rounded-xl border border-maroon-900/15 bg-cream-100 py-3 pl-10 pr-4 text-base text-maroon-950 placeholder:text-maroon-700/40 transition-colors focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/40 sm:min-h-0 sm:py-2.5 sm:text-sm"
          aria-label="Search products"
          autoComplete="off"
        />
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <FilterSection label="Category">
          <div className="flex flex-wrap gap-2 sm:gap-1.5">
            <Pill active={filters.category === ""} onClick={() => onCategory("")}>
              All
            </Pill>
            {categories.map((c) => (
              <Pill key={c} active={filters.category === c} onClick={() => onCategory(c)}>
                {c}
              </Pill>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Style */}
      {styles.length > 0 && (
        <FilterSection label="Style">
          <div className="flex flex-wrap gap-2 sm:gap-1.5">
            <Pill active={filters.style === ""} onClick={() => onStyle("")}>
              All
            </Pill>
            {styles.map((s) => (
              <Pill key={s} active={filters.style === s} onClick={() => onStyle(s)}>
                {s}
              </Pill>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Color */}
      {colorOptions.length > 0 && (
        <FilterSection label="Color">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onColor("")}
              title="All colors"
              aria-label="All colors"
              aria-pressed={filters.color === ""}
              className={cn(
                "h-10 w-10 rounded-full border-2 transition-all duration-150 sm:h-7 sm:w-7",
                "bg-gradient-to-br from-gray-200 to-gray-400",
                filters.color === ""
                  ? "scale-110 border-gold-500 shadow-gold"
                  : "border-black/10 hover:scale-105"
              )}
            />
            {colorOptions.map(([name, hex]) => (
              <button
                key={name}
                type="button"
                onClick={() => onColor(name === filters.color ? "" : name)}
                title={name}
                aria-label={name}
                aria-pressed={filters.color === name}
                className={cn(
                  "h-10 w-10 rounded-full border-2 transition-all duration-150 sm:h-7 sm:w-7",
                  filters.color === name
                    ? "scale-110 border-gold-500 shadow-gold"
                    : "border-black/10 hover:scale-105"
                )}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Size */}
      {sizes.length > 0 && (
        <FilterSection label="Size">
          <div className="flex flex-wrap gap-2 sm:gap-1.5">
            <Pill active={filters.size === ""} onClick={() => onSize("")}>
              All
            </Pill>
            {sizes.map((s) => (
              <Pill key={s} active={filters.size === s} onClick={() => onSize(s)}>
                {s}
              </Pill>
            ))}
          </div>
        </FilterSection>
      )}

      <div className="flex items-center justify-between border-t border-cream-300 pt-1">
        <p className="text-xs font-medium text-maroon-700/60">
          <span className="font-bold text-maroon-900">{resultCount}</span> results
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-maroon-900 underline underline-offset-2 transition-colors hover:text-gold-600"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[0.7rem] font-bold uppercase tracking-widest text-maroon-700/60">{label}</p>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition-all duration-150 sm:min-h-0 sm:py-1 sm:text-xs",
        active
          ? "border-maroon-900 bg-maroon-900 text-cream"
          : "border-maroon-900/20 bg-cream-100 text-maroon-950 hover:border-gold-500"
      )}
    >
      {children}
    </button>
  );
}
