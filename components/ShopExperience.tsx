"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { getCategoryMeta } from "@/data/categoryMeta";
import { useFilter } from "@/hooks/useFilter";
import CategoryCard from "@/components/ui/CategoryCard";
import FilterBar from "@/components/ui/FilterBar";
import FilterModal from "@/components/ui/FilterModal";
import ProductCard from "@/components/ui/ProductCard";
import { cn } from "@/lib/utils";

async function fetchCatalog(): Promise<Product[]> {
  const res = await fetch("/api/products", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export default function ShopExperience() {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchCatalog()
      .then(setCatalog)
      .catch(() => setError("Could not load products. Is the database set up?"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const {
    filters,
    filtered,
    filterOptions,
    hasActiveFilters,
    setCategory,
    setStyle,
    setSize,
    setColor,
    setSearch,
    reset,
  } = useFilter({ products: catalog });

  const { categories, styles, sizes, colors } = filterOptions;

  const activeFilterCount = [
    filters.category,
    filters.style,
    filters.size,
    filters.color,
    filters.search.trim(),
  ].filter(Boolean).length;

  if (loading) {
    return (
      <section className="border-t border-gold-500/10 bg-cream-100 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="font-display text-lg text-maroon-800/70">Loading collection…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="border-t border-gold-500/10 bg-cream-100 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-maroon-900">{error}</p>
          <button type="button" onClick={load} className="btn-outline mt-4 text-sm">
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (catalog.length === 0) {
    return (
      <section className="border-t border-gold-500/10 bg-cream-100 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="font-display text-xl text-maroon-900">No products yet</p>
          <p className="mt-2 text-sm text-maroon-800/75">
            Run <code className="rounded bg-cream-300 px-1">npm run db:push &amp;&amp; npm run db:seed</code> or add items in Admin.
          </p>
          <Link href="/admin" className="btn-gold mt-6 inline-flex">
            Open admin
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="categories" className="scroll-mt-20 border-t border-gold-500/10 bg-cream py-10 sm:py-16 lg:py-18">
        <div className="mx-auto max-w-6xl px-3 sm:px-6">
          <div className="text-center">
            <span className="section-tag">Shop by category</span>
            <h2 className="font-display mt-2 text-2xl font-semibold text-maroon-900 sm:mt-3 sm:text-3xl lg:text-4xl">Find your style</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-maroon-800/75 sm:text-base">
              Categories and filters update from the live catalog — including items added in Admin.
            </p>
          </div>
          <div
            className="scrollbar-hide -mx-3 mt-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-1 pt-0.5 sm:mx-0 sm:mt-10 sm:px-0"
            role="list"
            aria-label="Shop by category"
          >
            {categories.map((cat) => {
              const meta = getCategoryMeta(cat);
              const count = catalog.filter((p) => p.category === cat).length;
              const isActive = filters.category === cat;
              return (
                <div key={cat} role="listitem" className="shrink-0">
                  <CategoryCard
                    category={cat}
                    labelHint={meta.iconHindi || undefined}
                    count={count}
                    isActive={isActive}
                    onClick={() => setCategory(isActive ? "" : cat)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="collection" className="scroll-mt-20 border-t border-gold-500/10 bg-cream-100 py-10 sm:py-16 lg:py-18">
        <div className="mx-auto max-w-6xl px-3 sm:px-6">
          <div className="text-center">
            <span className="section-tag">Collection</span>
            <h2 className="font-display mt-2 text-2xl font-semibold text-maroon-900 sm:mt-3 sm:text-3xl lg:text-4xl">
              Curated for your family
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-maroon-800/75 sm:text-base">
              Tap <strong>Filter</strong> to search and narrow by category, style, colour, and size.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-5 sm:mt-10 sm:gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
              <p className="text-sm text-maroon-800/80">
                Showing <span className="font-semibold text-maroon-900">{filtered.length}</span> of{" "}
                {catalog.length} products
              </p>
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className={cn(
                  "inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-full border-2 px-5 text-base font-semibold transition-colors sm:w-auto sm:min-h-0 sm:py-2.5 sm:text-sm",
                  hasActiveFilters
                    ? "border-maroon-900 bg-maroon-900 text-cream hover:bg-maroon-950"
                    : "border-maroon-900/25 bg-white text-maroon-900 shadow-card hover:border-gold-500/50"
                )}
                aria-expanded={filterOpen}
                aria-controls="filter-panel"
              >
                <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filter
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-gold-500/90 px-2 py-0.5 text-[0.65rem] font-bold text-maroon-950">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-maroon-900/25 bg-white/80 py-16 text-center">
                <p className="font-display text-lg text-maroon-900">No products match</p>
                <p className="mt-2 text-sm text-maroon-800/65">Adjust filters or clear them to see more.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => setFilterOpen(true)} className="btn-gold text-sm">
                    Open filters
                  </button>
                  <button type="button" onClick={reset} className="btn-outline text-sm">
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-3 lg:gap-5 xl:gap-6">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>

        <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter products">
          <div id="filter-panel">
            <FilterBar
              filters={filters}
              categories={categories}
              styles={styles}
              sizes={sizes}
              colorOptions={colors}
              onCategory={setCategory}
              onStyle={setStyle}
              onSize={setSize}
              onColor={setColor}
              onSearch={setSearch}
              onReset={reset}
              hasActive={hasActiveFilters}
              resultCount={filtered.length}
              className="border-0 bg-transparent p-0 shadow-none"
            />
          </div>
        </FilterModal>
      </section>
    </>
  );
}
