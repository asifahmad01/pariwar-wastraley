"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category, Style } from "@/types";
import { cn } from "@/lib/utils";

type VariantRow = {
  id: string;
  color: string;
  colorHex: string;
  size: string;
  stock: string;
};

function newVariantRow(): VariantRow {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `v-${Math.random().toString(36).slice(2)}`,
    color: "",
    colorHex: "#722F37",
    size: "",
    stock: "0",
  };
}

export default function NewProductPage() {
  const router = useRouter();
  const formId = useId();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [styleOptions, setStyleOptions] = useState<Style[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [style, setStyle] = useState("");
  const [description, setDescription] = useState("");
  const [fabric, setFabric] = useState("");
  const [price, setPrice] = useState("");
  const [showPrice, setShowPrice] = useState(true);
  const [newArrival, setNewArrival] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newStyleName, setNewStyleName] = useState("");
  const [addingStyle, setAddingStyle] = useState(false);

  const [variantRows, setVariantRows] = useState<VariantRow[]>(() => [newVariantRow()]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  useEffect(() => {
    if (!imageFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const toggleCategoryId = (id: string) =>
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const addCategoryInline = async () => {
    const n = newCategoryName.trim();
    if (!n) return;
    setAddingCategory(true);
    setFormError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; name?: string; error?: string };
      if (!res.ok) {
        setFormError(typeof data.error === "string" ? data.error : "Could not add category");
        return;
      }
      if (data.id && data.name) {
        setCategoryOptions((prev) => {
          if (prev.some((c) => c.id === data.id)) return prev;
          return [...prev, { id: data.id!, name: data.name!, productCount: 0 }].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        });
        setSelectedCategoryIds((prev) => (prev.includes(data.id!) ? prev : [...prev, data.id!]));
      }
      setNewCategoryName("");
    } finally {
      setAddingCategory(false);
    }
  };

  const addStyleInline = async () => {
    const n = newStyleName.trim();
    if (!n) return;
    setAddingStyle(true);
    setFormError("");
    try {
      const res = await fetch("/api/styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; name?: string; error?: string };
      if (!res.ok) {
        setFormError(typeof data.error === "string" ? data.error : "Could not add style");
        return;
      }
      if (data.name && data.id) {
        const sid = data.id;
        const sname = data.name;
        setStyleOptions((prev) => {
          if (prev.some((s) => s.name === sname)) return prev;
          return [...prev, { id: sid, name: sname, productCount: 0 }].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        });
        setStyle(sname);
      }
      setNewStyleName("");
    } finally {
      setAddingStyle(false);
    }
  };

  const setVariantAt = (id: string, patch: Partial<Pick<VariantRow, "color" | "colorHex" | "size" | "stock">>) =>
    setVariantRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addVariantRow = () => setVariantRows((r) => [...r, newVariantRow()]);
  const removeVariantRow = (id: string) =>
    setVariantRows((r) => (r.length <= 1 ? r : r.filter((row) => row.id !== id)));

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    const variantsPayload = variantRows
      .map((row) => {
        const stockRaw = row.stock.trim();
        const stockQty = stockRaw === "" ? 0 : Number.parseInt(row.stock, 10);
        return {
          color: row.color.trim(),
          colorHex: row.colorHex,
          size: row.size.trim(),
          stockQty,
        };
      })
      .filter((v) => v.color && v.size);

    if (variantsPayload.length === 0) {
      setFormError("Add at least one variant with color and size.");
      return;
    }
    for (const v of variantsPayload) {
      if (Number.isNaN(v.stockQty) || v.stockQty < 0) {
        setFormError("Stock must be a non-negative number for each variant.");
        return;
      }
    }

    if (!style.trim()) {
      setFormError("Select or create a style.");
      return;
    }

    setSubmitting(true);

    let imageUrl = "";
    if (imageFile) {
      const fdUp = new FormData();
      fdUp.append("file", imageFile);
      try {
        const up = await fetch("/api/upload", { method: "POST", body: fdUp, credentials: "include" });
        const upData = (await up.json().catch(() => ({}))) as { secureUrl?: string; error?: string };
        if (!up.ok) {
          setFormError(
            typeof upData.error === "string"
              ? upData.error
              : up.status === 413
                ? "Image too large (max 5MB)."
                : up.status === 503
                  ? "Cloudinary not configured. Add CLOUDINARY_* env vars or save without an image."
                  : "Image upload failed."
          );
          setSubmitting(false);
          return;
        }
        if (!upData.secureUrl) {
          setFormError("Upload succeeded but no URL returned.");
          setSubmitting(false);
          return;
        }
        imageUrl = upData.secureUrl;
      } catch {
        setFormError("Network error during upload.");
        setSubmitting(false);
        return;
      }
    }

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("nameHi", nameHi.trim());
    fd.append("categoryIds", JSON.stringify(selectedCategoryIds));
    fd.append("style", style.trim());
    fd.append("description", description.trim());
    fd.append("fabric", fabric.trim());
    fd.append("showPrice", showPrice ? "1" : "0");
    fd.append("price", showPrice && price.trim() ? price.trim() : "");
    fd.append("badge", newArrival ? "new" : "");
    fd.append("variants", JSON.stringify(variantsPayload));
    if (imageUrl) fd.append("imageUrl", imageUrl);

    try {
      const res = await fetch("/api/products", { method: "POST", body: fd, credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFormError(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      setSuccess("Product saved! Redirecting…");
      setTimeout(() => router.push("/admin"), 1000);
    } finally {
      setSubmitting(false);
    }
  };

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-maroon-800/60">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      <header className="sticky top-0 z-10 border-b border-gold-500/20 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin" className="shrink-0 text-sm text-maroon-800/70 hover:text-maroon-900">
              ← Products
            </Link>
            <span className="text-maroon-800/30 shrink-0">/</span>
            <h1 className="font-display truncate text-lg font-semibold text-maroon-900">Add product</h1>
          </div>
          <Link href="/" className="shrink-0 rounded-full border border-maroon-900/20 px-3 py-1.5 text-xs font-semibold text-maroon-900">
            View store
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 pt-8">
        <p className="mb-6 text-sm text-maroon-800/55">
          Create a product with images, categories, style, and per–color/size stock variants.
        </p>

        <form id={formId} onSubmit={saveProduct} className="space-y-6">
          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{formError}</p>
          )}
          {success && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{success}</p>
          )}

          {/* Image */}
          <section className="rounded-2xl border border-gold-500/20 bg-white p-6 shadow-sm">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-maroon-900/80">
              Image
            </h2>
            <p className="mt-1 text-xs text-maroon-800/50">
              JPEG, PNG, WebP, or GIF — uploaded via Cloudinary when you save.
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-4 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-maroon-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-cream"
              onChange={(e) => { setImageFile(e.target.files?.[0] ?? null); setFormError(""); }}
            />
            {previewUrl && (
              <div className="relative mt-4 inline-block max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-72 max-w-full rounded-xl border border-gold-500/25 object-contain shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="absolute right-2 top-2 rounded-full bg-maroon-950/90 px-2.5 py-1 text-xs font-semibold text-cream"
                >
                  Remove
                </button>
              </div>
            )}
          </section>

          {/* Core */}
          <section className="rounded-2xl border border-gold-500/20 bg-white p-6 shadow-sm">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-maroon-900/80">
              Details
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor={`${formId}-name`} className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                  Product name *
                </label>
                <input
                  id={`${formId}-name`}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm"
                  placeholder="e.g. Silk kurta set"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${formId}-nameHi`} className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                  Name (Hindi, optional)
                </label>
                <input
                  id={`${formId}-nameHi`}
                  value={nameHi}
                  onChange={(e) => setNameHi(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm font-hindi"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${formId}-desc`} className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                  Description
                </label>
                <textarea
                  id={`${formId}-desc`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1.5 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm"
                  placeholder="Materials, fit notes, care…"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${formId}-fabric`} className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                  Fabric (optional)
                </label>
                <input
                  id={`${formId}-fabric`}
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm"
                />
              </div>
            </div>
          </section>

          {/* Categories & style */}
          <section className="rounded-2xl border border-gold-500/20 bg-white p-6 shadow-sm">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-maroon-900/80">
              Categories & style
            </h2>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">Categories</p>
              <p className="mt-1 text-xs text-maroon-800/50">Select one or more. Add a new label without leaving the form.</p>
              {categoryOptions.length === 0 ? (
                <p className="mt-3 text-sm text-maroon-800/60">
                  No categories yet — add one below or{" "}
                  <Link href="/admin/taxonomy" className="font-semibold underline">
                    open taxonomy
                  </Link>
                  .
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategoryId(cat.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        selectedCategoryIds.includes(cat.id)
                          ? "border-maroon-900 bg-maroon-900 text-cream"
                          : "border-maroon-900/20 bg-cream-100 text-maroon-950 hover:border-maroon-900/40"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="min-w-[12rem] flex-1">
                  <label htmlFor={`${formId}-newcat`} className="sr-only">
                    New category name
                  </label>
                  <input
                    id={`${formId}-newcat`}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); void addCategoryInline(); }
                    }}
                    placeholder="New category name"
                    className="w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={addingCategory || !newCategoryName.trim()}
                  onClick={() => void addCategoryInline()}
                  className="rounded-xl border border-maroon-900/25 bg-white px-4 py-2 text-sm font-semibold text-maroon-900 hover:bg-cream-100 disabled:opacity-50"
                >
                  {addingCategory ? "Adding…" : "Add category"}
                </button>
              </div>
            </div>

            <div className="mt-8 border-t border-gold-500/15 pt-6">
              <label htmlFor={`${formId}-style`} className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                Style *
              </label>
              {styleOptions.length === 0 ? (
                <p className="mt-2 text-sm text-maroon-800/60">
                  No styles in the list yet — create one below or in{" "}
                  <Link href="/admin/taxonomy" className="font-semibold underline">taxonomy</Link>.
                </p>
              ) : (
                <select
                  id={`${formId}-style`}
                  required={styleOptions.length > 0}
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="mt-1.5 w-full max-w-md rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm"
                >
                  <option value="">Select a style…</option>
                  {styleOptions.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              )}
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="min-w-[12rem] flex-1">
                  <label htmlFor={`${formId}-newstyle`} className="sr-only">
                    New style name
                  </label>
                  <input
                    id={`${formId}-newstyle`}
                    value={newStyleName}
                    onChange={(e) => setNewStyleName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); void addStyleInline(); }
                    }}
                    placeholder="New style name"
                    className="w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={addingStyle || !newStyleName.trim()}
                  onClick={() => void addStyleInline()}
                  className="rounded-xl border border-maroon-900/25 bg-white px-4 py-2 text-sm font-semibold text-maroon-900 hover:bg-cream-100 disabled:opacity-50"
                >
                  {addingStyle ? "Adding…" : "Add style"}
                </button>
              </div>
            </div>
          </section>

          {/* Variants */}
          <section className="rounded-2xl border border-gold-500/20 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-maroon-900/80">
                  Variants
                </h2>
                <p className="mt-1 text-xs text-maroon-800/50">
                  One row per color & size. Stock is tracked per combination.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariantRow}
                className="rounded-xl border border-maroon-900/20 bg-cream-50 px-3 py-2 text-xs font-semibold text-maroon-900 hover:bg-cream-100"
              >
                + Add row
              </button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-maroon-900/10">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-maroon-900/10 bg-cream-50/90 text-xs uppercase tracking-wide text-maroon-800/70">
                    <th className="px-3 py-2.5 font-semibold">Color *</th>
                    <th className="px-3 py-2.5 font-semibold">Swatch</th>
                    <th className="px-3 py-2.5 font-semibold">Size *</th>
                    <th className="px-3 py-2.5 font-semibold">Stock</th>
                    <th className="w-24 px-3 py-2.5 font-semibold text-right"> </th>
                  </tr>
                </thead>
                <tbody>
                  {variantRows.map((row) => (
                    <tr key={row.id} className="border-b border-maroon-900/5 last:border-0">
                      <td className="px-3 py-2 align-middle">
                        <input
                          value={row.color}
                          onChange={(e) => setVariantAt(row.id, { color: e.target.value })}
                          placeholder="Maroon"
                          className="w-full min-w-[7rem] rounded-lg border border-maroon-900/15 bg-cream-100 px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="color"
                          value={row.colorHex}
                          onChange={(e) => setVariantAt(row.id, { colorHex: e.target.value })}
                          className="h-9 w-14 cursor-pointer rounded border border-maroon-900/15"
                          title="Color"
                        />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <input
                          value={row.size}
                          onChange={(e) => setVariantAt(row.id, { size: e.target.value })}
                          placeholder="M"
                          className="w-full min-w-[5rem] rounded-lg border border-maroon-900/15 bg-cream-100 px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={row.stock}
                          onChange={(e) => setVariantAt(row.id, { stock: e.target.value })}
                          className="w-24 rounded-lg border border-maroon-900/15 bg-cream-100 px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 text-right align-middle">
                        <button
                          type="button"
                          onClick={() => removeVariantRow(row.id)}
                          disabled={variantRows.length <= 1}
                          className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-30 disabled:hover:no-underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pricing & flags */}
          <section className="rounded-2xl border border-gold-500/20 bg-white p-6 shadow-sm">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-maroon-900/80">
              Pricing & visibility
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm font-medium text-maroon-900">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded border-maroon-900/30"
                />
                Show price on storefront
              </label>
              <div>
                <label htmlFor={`${formId}-price`} className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
                  Price (₹)
                </label>
                <input
                  id={`${formId}-price`}
                  type="number"
                  min={0}
                  step={1}
                  disabled={!showPrice}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm disabled:opacity-50"
                  placeholder="Optional"
                />
              </div>
            </div>
            <label className="mt-5 flex items-center gap-2 text-sm font-medium text-maroon-900">
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(e) => setNewArrival(e.target.checked)}
                className="rounded border-maroon-900/30"
              />
              New arrival (show “New” badge)
            </label>
          </section>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold px-8 py-3 text-sm disabled:opacity-60"
            >
              {submitting ? "Uploading & saving…" : "Save product"}
            </button>
            <Link
              href="/admin"
              className="rounded-xl border border-maroon-900/20 px-5 py-3 text-sm font-semibold text-maroon-900 hover:bg-white"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
