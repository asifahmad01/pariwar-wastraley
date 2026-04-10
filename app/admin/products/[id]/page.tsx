"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import type { Category, Product, Style, Variant } from "@/types";
import { cn } from "@/lib/utils";

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

type Tab = "details" | "variants";

type ColorRow = { name: string; hex: string };

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("details");

  // — Taxonomy options (from managed tables) —
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [styleOptions, setStyleOptions] = useState<Style[]>([]);

  // — Product fields —
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [style, setStyle] = useState("");
  const [description, setDescription] = useState("");
  const [fabric, setFabric] = useState("");
  const [price, setPrice] = useState("");
  const [showPrice, setShowPrice] = useState(true);
  const [badge, setBadge] = useState<"" | "new" | "trending">("");
  const [isVisible, setIsVisible] = useState(true);

  // Colors on the product (master list)
  const [colorRows, setColorRows] = useState<ColorRow[]>([]);
  // Sizes on the product (master list)
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");

  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsSuccess, setDetailsSuccess] = useState("");

  // — Variants —
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  // Inline stock edits: variantId → draft value
  const [stockDraft, setStockDraft] = useState<Record<string, string>>({});
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null);

  // Add variant form
  const [addColor, setAddColor] = useState("");
  const [addColorHex, setAddColorHex] = useState("#722F37");
  const [addSize, setAddSize] = useState("");
  const [addStock, setAddStock] = useState("0");
  const [addingVariant, setAddingVariant] = useState(false);
  const [variantError, setVariantError] = useState("");

  // Auth check + taxonomy load
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) { router.replace("/admin"); return; }
        setAuthed(true);
        fetch("/api/categories").then((r) => r.json()).then((d: Category[]) => setCategoryOptions(d)).catch(() => {});
        fetch("/api/styles").then((r) => r.json()).then((d: Style[]) => setStyleOptions(d)).catch(() => {});
      })
      .catch(() => router.replace("/admin"));
  }, [router]);

  // Load product
  useEffect(() => {
    if (!authed) return;
    fetch(`/api/products/${productId}`, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then((data: Product) => {
        setProduct(data);
        setName(data.name);
        setNameHi(data.nameHi ?? "");
        setSelectedCategoryIds(data.categoryIds ?? []);
        setStyle(data.style);
        setDescription(data.description ?? "");
        setFabric(data.fabric ?? "");
        setPrice(data.price > 0 ? String(data.price) : "");
        setShowPrice(data.showPrice);
        setBadge(data.badge === "new" || data.badge === "trending" ? data.badge : "");
        setIsVisible(data.isVisible ?? true);
        setColorRows(
          data.colors.map((c, i) => ({ name: c, hex: data.colorHex[i] ?? "#722F37" }))
        );
        setSizes(data.sizes);
      })
      .catch(() => router.replace("/admin"));
  }, [authed, productId, router]);

  // Load variants
  const loadVariants = useCallback(() => {
    setVariantsLoading(true);
    fetch(`/api/products/${productId}/variants`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Variant[]) => {
        setVariants(d);
        // Initialise stock draft from loaded values
        const drafts: Record<string, string> = {};
        d.forEach((v) => { drafts[v.id] = String(v.stockQty); });
        setStockDraft(drafts);
      })
      .catch(() => {})
      .finally(() => setVariantsLoading(false));
  }, [productId]);

  useEffect(() => {
    if (authed) loadVariants();
  }, [authed, loadVariants]);

  // Derived: available colors and sizes from master lists
  const colorOptions = useMemo(() => colorRows.map((r) => r.name).filter(Boolean), [colorRows]);
  const sizeOptions = sizes;

  const toggleCategoryId = (id: string) =>
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ——— Product details save ———
  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setDetailsError("");
    setDetailsSuccess("");

    const colorNames = colorRows.map((c) => c.name.trim()).filter(Boolean);
    const hexes = colorRows
      .filter((c) => c.name.trim())
      .map((c) => (c.hex.match(/^#[0-9A-Fa-f]{6}$/) ? c.hex : "#722F37"));

    if (colorNames.length === 0) {
      setDetailsError("At least one color is required.");
      return;
    }

    setDetailsSaving(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          nameHi: nameHi.trim() || null,
          categoryIds: selectedCategoryIds,
          style: style.trim(),
          description: description.trim() || null,
          fabric: fabric.trim() || null,
          price: showPrice && price.trim() ? Number(price.trim()) : null,
          showPrice,
          badge: badge || null,
          isVisible,
          colors: colorNames,
          colorHex: hexes,
          sizes,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        setDetailsError(d.error ?? "Save failed.");
        return;
      }
      setDetailsSuccess("Saved.");
      setTimeout(() => setDetailsSuccess(""), 3000);
    } finally {
      setDetailsSaving(false);
    }
  };

  // ——— Variant stock update ———
  const saveVariantStock = async (variantId: string) => {
    setSavingVariantId(variantId);
    try {
      await fetch(`/api/products/${productId}/variants/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQty: Number(stockDraft[variantId] ?? 0) }),
      });
      loadVariants();
    } finally {
      setSavingVariantId(null);
    }
  };

  const toggleVariantActive = async (variant: Variant) => {
    setSavingVariantId(variant.id);
    try {
      await fetch(`/api/products/${productId}/variants/${variant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !variant.isActive }),
      });
      loadVariants();
    } finally {
      setSavingVariantId(null);
    }
  };

  const deleteVariant = async (variantId: string) => {
    if (!confirm("Remove this variant permanently?")) return;
    await fetch(`/api/products/${productId}/variants/${variantId}`, { method: "DELETE" });
    loadVariants();
  };

  // ——— Add variant ———
  const addVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    setVariantError("");
    if (!addColor.trim() || !addSize.trim()) {
      setVariantError("Color and size are required.");
      return;
    }
    setAddingVariant(true);
    try {
      const res = await fetch(`/api/products/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          color: addColor.trim(),
          colorHex: addColorHex,
          size: addSize.trim(),
          stockQty: Number(addStock),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        setVariantError(d.error ?? "Failed to add variant.");
        return;
      }
      setAddColor("");
      setAddColorHex("#722F37");
      setAddSize("");
      setAddStock("0");
      loadVariants();
    } finally {
      setAddingVariant(false);
    }
  };

  // ——— Color/size list helpers ———
  const addColorRow = () => setColorRows((r) => [...r, { name: "", hex: "#722F37" }]);
  const removeColorRow = (i: number) =>
    setColorRows((r) => (r.length <= 1 ? r : r.filter((_, j) => j !== i)));
  const setColorAt = (i: number, patch: Partial<ColorRow>) =>
    setColorRows((rows) => rows.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  const addSizeToList = () => {
    const t = newSize.trim();
    if (!t || sizes.includes(t)) return;
    setSizes((s) => [...s, t]);
    setNewSize("");
  };
  const removeSizeFromList = (s: string) => setSizes((list) => list.filter((x) => x !== s));

  if (authed === null || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-maroon-800/60">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gold-500/20 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin" className="shrink-0 text-sm text-maroon-800/70 hover:text-maroon-900">
              ← Products
            </Link>
            <span className="text-maroon-800/30">/</span>
            <h1 className="font-display truncate text-lg font-semibold text-maroon-900">
              {product.name}
            </h1>
          </div>
          <Link href="/" className="shrink-0 rounded-full border border-maroon-900/20 px-3 py-1.5 text-xs font-semibold text-maroon-900">
            View Store
          </Link>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-3xl gap-0 border-t border-gold-500/10 px-4">
          {(["details", "variants"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors",
                tab === t
                  ? "border-maroon-900 text-maroon-900"
                  : "border-transparent text-maroon-800/50 hover:text-maroon-900"
              )}
            >
              {t === "variants" ? "Variants & Stock" : "Product Details"}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-8">
        {/* ——— DETAILS TAB ——— */}
        {tab === "details" && (
          <form
            onSubmit={saveDetails}
            className="space-y-6 rounded-2xl border border-gold-500/20 bg-white p-6 shadow-card sm:p-8"
          >
            {detailsError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{detailsError}</p>
            )}
            {detailsSuccess && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{detailsSuccess}</p>
            )}

            {/* Visibility toggle — prominent */}
            <div className="flex items-center justify-between rounded-xl border border-maroon-900/10 bg-cream-50/80 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-maroon-900">
                  {isVisible ? "Visible on storefront" : "Hidden from storefront"}
                </p>
                <p className="text-xs text-maroon-800/55">
                  {isVisible ? "Customers can see this product." : "Only admins can see this product."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsVisible((v) => !v)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                  isVisible
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                )}
              >
                {isVisible ? "Hide" : "Show"}
              </button>
            </div>

            {/* Core fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                  Product name *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                  Name (Hindi, optional)
                </label>
                <input
                  value={nameHi}
                  onChange={(e) => setNameHi(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm font-hindi"
                />
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                  Categories
                </p>
                {categoryOptions.length === 0 ? (
                  <p className="mt-2 text-xs text-maroon-800/50">
                    No categories yet.{" "}
                    <Link href="/admin/taxonomy" className="underline">
                      Create categories first →
                    </Link>
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategoryId(cat.id)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          selectedCategoryIds.includes(cat.id)
                            ? "border-maroon-900 bg-maroon-900 text-cream"
                            : "border-maroon-900/20 bg-cream-100 text-maroon-950"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                  Style *
                </label>
                {styleOptions.length === 0 ? (
                  <p className="mt-2 text-xs text-maroon-800/50">
                    No styles yet.{" "}
                    <Link href="/admin/taxonomy" className="underline">
                      Create styles first →
                    </Link>
                  </p>
                ) : (
                  <select
                    required
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm"
                  >
                    <option value="">Select a style…</option>
                    {styleOptions.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                Fabric (optional)
              </label>
              <input
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="mt-1 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm"
              />
            </div>

            {/* Colors — master list */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                Colors (master list)
              </p>
              <p className="mt-0.5 text-xs text-maroon-800/50">
                These are the colors available on this product. Add individual stock per color + size in the Variants tab.
              </p>
              <div className="mt-2 space-y-2">
                {colorRows.map((row, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <input
                      placeholder="Color name"
                      value={row.name}
                      onChange={(e) => setColorAt(i, { name: e.target.value })}
                      className="min-w-[8rem] flex-1 rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2 text-sm"
                    />
                    <input
                      type="color"
                      value={row.hex}
                      onChange={(e) => setColorAt(i, { hex: e.target.value })}
                      className="h-10 w-14 cursor-pointer rounded border border-maroon-900/15"
                    />
                    <button type="button" onClick={() => removeColorRow(i)} className="text-xs text-red-700">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addColorRow} className="mt-2 text-sm font-semibold text-maroon-900 underline">
                + Add color
              </button>
            </div>

            {/* Sizes — master list */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                Sizes (master list)
              </p>
              <p className="mt-0.5 text-xs text-maroon-800/50">
                All sizes this product comes in.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1 rounded-full border border-maroon-900/20 bg-cream-100 px-3 py-1 text-xs font-medium text-maroon-950"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSizeFromList(s)}
                      className="ml-1 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSizeToList())}
                  placeholder="Add size (e.g. XL, 38)"
                  className="min-w-0 flex-1 rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={addSizeToList}
                  className="rounded-xl border border-maroon-900/20 px-3 py-2 text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                  />
                  Show price on storefront
                </label>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                  Price (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  disabled={!showPrice}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm disabled:opacity-50"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Badge */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                Badge
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value as "" | "new" | "trending")}
                className="mt-1 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm"
              >
                <option value="">None</option>
                <option value="new">New Arrival</option>
                <option value="trending">Trending</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={detailsSaving}
              className="btn-gold w-full justify-center disabled:opacity-60"
            >
              {detailsSaving ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}

        {/* ——— VARIANTS TAB ——— */}
        {tab === "variants" && (
          <div className="space-y-6">
            {/* Existing variants */}
            <div className="rounded-2xl border border-gold-500/20 bg-white shadow-card">
              <div className="border-b border-gold-500/15 px-6 py-4">
                <h2 className="font-semibold text-maroon-900">Variants</h2>
                <p className="mt-0.5 text-xs text-maroon-800/55">
                  Each row is a unique color + size combination. Stock of 0 marks it as sold out.
                </p>
              </div>

              {variantsLoading ? (
                <p className="px-6 py-8 text-sm text-maroon-800/50">Loading variants…</p>
              ) : variants.length === 0 ? (
                <p className="px-6 py-8 text-sm text-maroon-800/50">
                  No variants yet. Add one below.
                </p>
              ) : (
                <div className="divide-y divide-gold-500/10">
                  {/* Table header */}
                  <div className="hidden grid-cols-[auto_1fr_1fr_6rem_5rem_auto] gap-3 px-6 py-2 text-xs font-bold uppercase tracking-widest text-maroon-800/40 sm:grid">
                    <span>Color</span>
                    <span>Color name</span>
                    <span>Size</span>
                    <span>Stock</span>
                    <span>Status</span>
                    <span></span>
                  </div>

                  {variants.map((v) => {
                    const inStock = v.stockQty > 0;
                    return (
                      <div
                        key={v.id}
                        className={cn(
                          "grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 px-6 py-3 sm:grid-cols-[auto_1fr_1fr_6rem_5rem_auto] sm:items-center",
                          !v.isActive && "opacity-50"
                        )}
                      >
                        {/* Color swatch */}
                        <span
                          className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-maroon-900/10"
                          style={{ backgroundColor: v.colorHex }}
                        />
                        {/* Color name */}
                        <span className="text-sm font-medium text-maroon-900">{v.color}</span>

                        {/* Size */}
                        <span className="col-start-2 text-xs text-maroon-800/70 sm:col-auto">
                          Size: <strong>{v.size}</strong>
                        </span>

                        {/* Stock inline edit */}
                        <div className="col-start-2 flex items-center gap-1.5 sm:col-auto">
                          <input
                            type="number"
                            min={0}
                            value={stockDraft[v.id] ?? String(v.stockQty)}
                            onChange={(e) =>
                              setStockDraft((d) => ({ ...d, [v.id]: e.target.value }))
                            }
                            className="w-16 rounded-lg border border-maroon-900/15 bg-cream-100 px-2 py-1 text-center text-sm"
                          />
                          <button
                            type="button"
                            disabled={savingVariantId === v.id}
                            onClick={() => saveVariantStock(v.id)}
                            className="rounded-lg bg-maroon-900 px-2 py-1 text-xs font-semibold text-cream disabled:opacity-50"
                          >
                            {savingVariantId === v.id ? "…" : "Save"}
                          </button>
                        </div>

                        {/* Status badge */}
                        <span
                          className={cn(
                            "col-start-2 w-fit rounded-full px-2 py-0.5 text-xs font-semibold sm:col-auto",
                            !v.isActive
                              ? "bg-maroon-100 text-maroon-700"
                              : inStock
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                          )}
                        >
                          {!v.isActive ? "Disabled" : inStock ? "In stock" : "Sold out"}
                        </span>

                        {/* Actions */}
                        <div className="col-start-2 flex gap-2 sm:col-auto">
                          <button
                            type="button"
                            disabled={savingVariantId === v.id}
                            onClick={() => toggleVariantActive(v)}
                            className="text-xs text-maroon-800/60 underline hover:text-maroon-900 disabled:opacity-50"
                          >
                            {v.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteVariant(v.id)}
                            className="text-xs text-red-700 underline hover:text-red-900"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add variant form */}
            <div className="rounded-2xl border border-gold-500/20 bg-white p-6 shadow-card">
              <h2 className="font-semibold text-maroon-900">Add Variant</h2>
              <p className="mt-0.5 text-xs text-maroon-800/55">
                Combine a color and size with an opening stock quantity. If the combination already
                exists its stock will be updated.
              </p>

              <form onSubmit={addVariant} className="mt-4 space-y-4">
                {variantError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{variantError}</p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Color select or freetext */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                      Color *
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        list="variant-color-list"
                        placeholder="Select or type"
                        value={addColor}
                        onChange={(e) => {
                          setAddColor(e.target.value);
                          // Auto-fill hex from master list
                          const match = colorRows.find((r) => r.name === e.target.value);
                          if (match) setAddColorHex(match.hex);
                        }}
                        className="flex-1 rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2 text-sm"
                        required
                      />
                      <input
                        type="color"
                        value={addColorHex}
                        onChange={(e) => setAddColorHex(e.target.value)}
                        className="h-10 w-12 cursor-pointer rounded border border-maroon-900/15"
                      />
                      <datalist id="variant-color-list">
                        {colorOptions.map((c) => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                      Size *
                    </label>
                    <input
                      list="variant-size-list"
                      placeholder="Select or type"
                      value={addSize}
                      onChange={(e) => setAddSize(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2 text-sm"
                      required
                    />
                    <datalist id="variant-size-list">
                      {sizeOptions.map((s) => <option key={s} value={s} />)}
                    </datalist>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                      Opening stock
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={addStock}
                      onChange={(e) => setAddStock(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingVariant}
                  className="btn-gold px-6 py-2 text-sm disabled:opacity-60"
                >
                  {addingVariant ? "Adding…" : "Add variant"}
                </button>
              </form>
            </div>

            {/* Availability summary */}
            {variants.length > 0 && (
              <div className="rounded-2xl border border-gold-500/20 bg-white p-6 shadow-card">
                <h2 className="font-semibold text-maroon-900">Availability Summary</h2>
                <p className="mt-0.5 mb-4 text-xs text-maroon-800/55">
                  Derived from active variants. What the frontend will show as available.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Colors */}
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-maroon-800/50">
                      Colors
                    </p>
                    {Array.from(new Set(variants.filter((v) => v.isActive).map((v) => v.color))).map((color) => {
                      const hasStock = variants.some(
                        (v) => v.color === color && v.isActive && v.stockQty > 0
                      );
                      const hex = variants.find((v) => v.color === color)?.colorHex ?? "#722F37";
                      return (
                        <div key={color} className="flex items-center gap-2 py-1">
                          <span
                            className="h-4 w-4 rounded-full border border-maroon-900/10"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="text-sm text-maroon-900">{color}</span>
                          <span
                            className={cn(
                              "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold",
                              hasStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            )}
                          >
                            {hasStock ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sizes */}
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-maroon-800/50">
                      Sizes
                    </p>
                    {Array.from(new Set(variants.filter((v) => v.isActive).map((v) => v.size))).map((size) => {
                      const hasStock = variants.some(
                        (v) => v.size === size && v.isActive && v.stockQty > 0
                      );
                      return (
                        <div key={size} className="flex items-center gap-2 py-1">
                          <span className="rounded-full border border-maroon-900/15 px-2 py-0.5 text-xs font-medium text-maroon-900">
                            {size}
                          </span>
                          <span
                            className={cn(
                              "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold",
                              hasStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            )}
                          >
                            {hasStock ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
