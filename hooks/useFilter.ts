"use client";

import { useMemo, useState } from "react";
import type { Product, FilterState } from "@/types";
import { deriveAllFilterOptions } from "@/lib/deriveFilterOptions";

const EMPTY_FILTER: FilterState = {
  category: "",
  style: "",
  size: "",
  color: "",
  search: "",
};

export interface UseFilterOptions {
  /** Catalog from GET /api/products (or [] while loading) */
  products?: Product[];
}

/**
 * Client-side filters: category, style, size, color, search.
 * Category filter checks the product's categories[] array (multi-category support)
 * and falls back to the legacy category string for existing products.
 */
export function useFilter({ products: productsProp }: UseFilterOptions = {}) {
  const products = productsProp ?? [];

  const filterOptions = useMemo(() => deriveAllFilterOptions(products), [products]);

  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTER);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return products.filter((p) => {
      // Multi-category: match if ANY of the product's categories equals the filter
      if (filters.category) {
        const inJoin = (p.categories ?? []).includes(filters.category);
        const inLegacy = p.category === filters.category;
        if (!inJoin && !inLegacy) return false;
      }
      if (filters.style && p.style !== filters.style) return false;
      if (filters.size && !p.sizes.includes(filters.size)) return false;
      if (filters.color && !p.colors.includes(filters.color)) return false;
      if (q) {
        const categoryText = (p.categories ?? []).join(" ") || p.category || "";
        const hay = [p.name, categoryText, p.style, p.nameHi ?? "", p.description ?? ""]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [filters, products]);

  const setCategory = (v: string) => setFilters((f) => ({ ...f, category: v }));
  const setStyle = (v: string) => setFilters((f) => ({ ...f, style: v }));
  const setSize = (v: string) => setFilters((f) => ({ ...f, size: v }));
  const setColor = (v: string) => setFilters((f) => ({ ...f, color: v }));
  const setSearch = (v: string) => setFilters((f) => ({ ...f, search: v }));
  const reset = () => setFilters(EMPTY_FILTER);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return {
    filters,
    filtered,
    /** Lists for filter UI — always in sync with product data */
    filterOptions,
    hasActiveFilters,
    setCategory,
    setStyle,
    setSize,
    setColor,
    setSearch,
    reset,
  };
}
