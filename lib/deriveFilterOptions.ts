import type { Product } from "@/types";

/** Unique categories from products (uses new categories[] array; falls back to legacy category) */
export function deriveCategories(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    // New: array of categories from join table
    if (p.categories && p.categories.length > 0) {
      for (const c of p.categories) if (c) set.add(c);
    } else if (p.category) {
      // Legacy fallback
      set.add(p.category);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** Unique styles from products, sorted A–Z */
export function deriveStyles(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    if (p.style) set.add(p.style);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** Unique sizes across all products; waist numbers first, then alphabetical */
export function deriveSizes(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    for (const s of p.sizes) set.add(s);
  }
  return Array.from(set).sort(compareSizeLabels);
}

function compareSizeLabels(a: string, b: string): number {
  const na = Number(a);
  const nb = Number(b);
  const aNum = !Number.isNaN(na) && String(na) === a;
  const bNum = !Number.isNaN(nb) && String(nb) === b;
  if (aNum && bNum) return na - nb;
  if (aNum) return -1;
  if (bNum) return 1;
  return a.localeCompare(b);
}

/** First occurrence of each color name wins for hex; sorted by color name */
export function deriveColorOptions(products: Product[]): [string, string][] {
  const map = new Map<string, string>();
  for (const p of products) {
    p.colors.forEach((name, i) => {
      if (!map.has(name)) map.set(name, p.colorHex[i] ?? "#888888");
    });
  }
  return Array.from(map.entries()).sort((x, y) => x[0].localeCompare(y[0]));
}

export interface DerivedFilterOptions {
  categories: string[];
  styles: string[];
  sizes: string[];
  colors: [string, string][];
}

export function deriveAllFilterOptions(products: Product[]): DerivedFilterOptions {
  return {
    categories: deriveCategories(products),
    styles: deriveStyles(products),
    sizes: deriveSizes(products),
    colors: deriveColorOptions(products),
  };
}
