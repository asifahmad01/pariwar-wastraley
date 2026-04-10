import type { Product as DbProduct } from "@prisma/client";
import type { Product } from "@/types";

type DbProductWithCategories = DbProduct & {
  categories?: Array<{ category: { id: string; name: string } }>;
};

export function dbToProduct(row: DbProductWithCategories): Product {
  let colors: string[] = [];
  let colorHex: string[] = [];
  let sizes: string[] = [];
  try { colors = JSON.parse(row.colors) as string[]; } catch { colors = []; }
  try { colorHex = JSON.parse(row.colorHex) as string[]; } catch { colorHex = []; }
  try { sizes = JSON.parse(row.sizes) as string[]; } catch { sizes = []; }

  const badge = row.badge === "new" || row.badge === "trending" ? row.badge : null;

  // Build category arrays from join table; fall back to legacy string if no join rows
  const categoryIds = row.categories?.map((pc) => pc.category.id) ?? [];
  const categoryNames = row.categories?.map((pc) => pc.category.name) ?? [];
  // Legacy: if no join rows exist, surface the legacy string so filters still work
  const legacyCategory = row.category ?? undefined;
  const effectiveCategories =
    categoryNames.length > 0 ? categoryNames : legacyCategory ? [legacyCategory] : [];

  return {
    id: row.id,
    name: row.name,
    nameHi: row.nameHi ?? undefined,
    category: legacyCategory,
    categories: effectiveCategories,
    categoryIds,
    style: row.style,
    badge,
    price: row.price ?? 0,
    showPrice: row.showPrice,
    colors,
    colorHex,
    sizes,
    image: row.image ?? undefined,
    description: row.description ?? undefined,
    fabric: row.fabric ?? undefined,
    isVisible: row.isVisible,
  };
}
