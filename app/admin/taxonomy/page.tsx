"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Category, Style } from "@/types";

type Tab = "categories" | "styles";

// ─── Reusable row component ───────────────────────────────────────────────────

function TaxonomyRow({
  name,
  productCount,
  onRename,
  onDelete,
}: {
  name: string;
  productCount: number;
  onRename: (newName: string) => Promise<string | null>;
  onDelete: () => Promise<string | null>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [busy, setBusy] = useState(false);
  const [rowError, setRowError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(name);
    setRowError("");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelEdit = () => { setEditing(false); setRowError(""); };

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) { cancelEdit(); return; }
    setBusy(true);
    const err = await onRename(trimmed);
    setBusy(false);
    if (err) { setRowError(err); return; }
    setEditing(false);
  };

  const del = async () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusy(true);
    const err = await onDelete();
    setBusy(false);
    if (err) setRowError(err);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {editing ? (
        <>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancelEdit();
            }}
            className="flex-1 rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="rounded-lg bg-maroon-900 px-3 py-1.5 text-xs font-semibold text-cream disabled:opacity-50"
          >
            {busy ? "…" : "Save"}
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="text-xs text-maroon-800/60 underline"
          >
            Cancel
          </button>
          {rowError && <p className="text-xs text-red-700">{rowError}</p>}
        </>
      ) : (
        <>
          <span className="flex-1 text-sm font-medium text-maroon-900">{name}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              productCount > 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-cream-100 text-maroon-800/50"
            )}
          >
            {productCount} product{productCount !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={startEdit}
            className="rounded-lg border border-maroon-900/15 px-2.5 py-1 text-xs font-medium text-maroon-900 hover:bg-cream-100"
          >
            Rename
          </button>
          <button
            type="button"
            disabled={busy || productCount > 0}
            onClick={del}
            title={productCount > 0 ? `Unassign from ${productCount} product(s) first` : "Delete"}
            className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete
          </button>
          {rowError && <p className="ml-2 text-xs text-red-700">{rowError}</p>}
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TaxonomyPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("categories");

  const [categories, setCategories] = useState<Category[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newStyleName, setNewStyleName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingStyle, setAddingStyle] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState("");
  const [addStyleError, setAddStyleError] = useState("");

  // Auth check
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (!d.ok) router.replace("/admin"); else setAuthed(true); })
      .catch(() => router.replace("/admin"));
  }, [router]);

  const loadCategories = useCallback(() => {
    fetch("/api/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Category[]) => setCategories(d))
      .catch(() => {});
  }, []);

  const loadStyles = useCallback(() => {
    fetch("/api/styles", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Style[]) => setStyles(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/styles").then((r) => r.json()),
    ])
      .then(([cats, stys]) => {
        setCategories(cats);
        setStyles(stys);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authed]);

  // ── Category actions ──
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddCategoryError("");
    const name = newCategoryName.trim();
    if (!name) return;
    setAddingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setAddCategoryError(data.error ?? "Failed to create category."); return; }
      setNewCategoryName("");
      loadCategories();
    } finally {
      setAddingCategory(false);
    }
  };

  const renameCategory = async (id: string, name: string): Promise<string | null> => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) return data.error ?? "Rename failed.";
    loadCategories();
    return null;
  };

  const deleteCategory = async (id: string): Promise<string | null> => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json() as { error?: string };
    if (!res.ok) return data.error ?? "Delete failed.";
    loadCategories();
    return null;
  };

  // ── Style actions ──
  const addStyle = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStyleError("");
    const name = newStyleName.trim();
    if (!name) return;
    setAddingStyle(true);
    try {
      const res = await fetch("/api/styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setAddStyleError(data.error ?? "Failed to create style."); return; }
      setNewStyleName("");
      loadStyles();
    } finally {
      setAddingStyle(false);
    }
  };

  const renameStyle = async (id: string, name: string): Promise<string | null> => {
    const res = await fetch(`/api/styles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) return data.error ?? "Rename failed.";
    loadStyles();
    return null;
  };

  const deleteStyle = async (id: string): Promise<string | null> => {
    const res = await fetch(`/api/styles/${id}`, { method: "DELETE" });
    const data = await res.json() as { error?: string };
    if (!res.ok) return data.error ?? "Delete failed.";
    loadStyles();
    return null;
  };

  if (authed === null) {
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
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-maroon-800/70 hover:text-maroon-900">
              ← Products
            </Link>
            <span className="text-maroon-800/30">/</span>
            <h1 className="font-display text-lg font-semibold text-maroon-900">
              Categories & Styles
            </h1>
          </div>
          <Link href="/" className="rounded-full border border-maroon-900/20 px-3 py-1.5 text-xs font-semibold text-maroon-900">
            View Store
          </Link>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-3xl border-t border-gold-500/10 px-4">
          {(["categories", "styles"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "border-b-2 px-5 py-2.5 text-sm font-medium capitalize transition-colors",
                tab === t
                  ? "border-maroon-900 text-maroon-900"
                  : "border-transparent text-maroon-800/50 hover:text-maroon-900"
              )}
            >
              {t === "categories" ? `Categories (${categories.length})` : `Styles (${styles.length})`}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 pt-8">
        {/* ── CATEGORIES TAB ── */}
        {tab === "categories" && (
          <>
            <div className="rounded-2xl border border-gold-500/20 bg-white shadow-card">
              <div className="border-b border-gold-500/15 px-6 py-4">
                <h2 className="font-semibold text-maroon-900">Categories</h2>
                <p className="mt-0.5 text-xs text-maroon-800/55">
                  Categories appear as filter pills on the storefront. A product can belong to
                  multiple categories. Delete is blocked while products are assigned.
                </p>
              </div>

              {loading ? (
                <p className="px-6 py-8 text-sm text-maroon-800/50">Loading…</p>
              ) : categories.length === 0 ? (
                <p className="px-6 py-8 text-sm text-maroon-800/50">
                  No categories yet. Add one below.
                </p>
              ) : (
                <div className="divide-y divide-gold-500/10">
                  {categories.map((cat) => (
                    <TaxonomyRow
                      key={cat.id}
                      name={cat.name}
                      productCount={cat.productCount ?? 0}
                      onRename={(name) => renameCategory(cat.id, name)}
                      onDelete={() => deleteCategory(cat.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Add category */}
            <div className="rounded-2xl border border-gold-500/20 bg-white p-6 shadow-card">
              <h2 className="font-semibold text-maroon-900">Add Category</h2>
              <p className="mt-0.5 text-xs text-maroon-800/55">
                Once created it will appear in the category selector when adding or editing products.
              </p>
              <form onSubmit={addCategory} className="mt-4 flex gap-2">
                <input
                  value={newCategoryName}
                  onChange={(e) => { setNewCategoryName(e.target.value); setAddCategoryError(""); }}
                  placeholder="e.g. Saree, Kurti, Kids Wear"
                  className="flex-1 rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={addingCategory}
                  className="btn-gold px-5 py-2 text-sm disabled:opacity-60"
                >
                  {addingCategory ? "Adding…" : "Add"}
                </button>
              </form>
              {addCategoryError && (
                <p className="mt-2 text-sm text-red-700">{addCategoryError}</p>
              )}
            </div>

            {/* How it works */}
            <div className="rounded-2xl border border-gold-500/10 bg-cream-50 p-5 text-sm text-maroon-800/70">
              <p className="font-semibold text-maroon-900">How categories flow to the storefront</p>
              <ol className="mt-2 space-y-1.5 list-decimal list-inside text-xs">
                <li>Create a category here (e.g. "Saree").</li>
                <li>Assign it to products in Add/Edit Product → Category section.</li>
                <li>The category pill automatically appears in the storefront filter bar.</li>
                <li>Customers can click it to filter all products in that category.</li>
                <li>A product assigned to multiple categories appears under each one.</li>
              </ol>
            </div>
          </>
        )}

        {/* ── STYLES TAB ── */}
        {tab === "styles" && (
          <>
            <div className="rounded-2xl border border-gold-500/20 bg-white shadow-card">
              <div className="border-b border-gold-500/15 px-6 py-4">
                <h2 className="font-semibold text-maroon-900">Styles</h2>
                <p className="mt-0.5 text-xs text-maroon-800/55">
                  Each product has exactly one style. Renaming a style updates all products using it.
                  Delete is blocked while products are assigned.
                </p>
              </div>

              {loading ? (
                <p className="px-6 py-8 text-sm text-maroon-800/50">Loading…</p>
              ) : styles.length === 0 ? (
                <p className="px-6 py-8 text-sm text-maroon-800/50">
                  No styles yet. Add one below.
                </p>
              ) : (
                <div className="divide-y divide-gold-500/10">
                  {styles.map((sty) => (
                    <TaxonomyRow
                      key={sty.id}
                      name={sty.name}
                      productCount={sty.productCount ?? 0}
                      onRename={(name) => renameStyle(sty.id, name)}
                      onDelete={() => deleteStyle(sty.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Add style */}
            <div className="rounded-2xl border border-gold-500/20 bg-white p-6 shadow-card">
              <h2 className="font-semibold text-maroon-900">Add Style</h2>
              <p className="mt-0.5 text-xs text-maroon-800/55">
                Once created it will appear as an option in the style selector on product forms.
              </p>
              <form onSubmit={addStyle} className="mt-4 flex gap-2">
                <input
                  value={newStyleName}
                  onChange={(e) => { setNewStyleName(e.target.value); setAddStyleError(""); }}
                  placeholder="e.g. Ethnic, Casual, Formal, Festive"
                  className="flex-1 rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={addingStyle}
                  className="btn-gold px-5 py-2 text-sm disabled:opacity-60"
                >
                  {addingStyle ? "Adding…" : "Add"}
                </button>
              </form>
              {addStyleError && (
                <p className="mt-2 text-sm text-red-700">{addStyleError}</p>
              )}
            </div>

            {/* How it works */}
            <div className="rounded-2xl border border-gold-500/10 bg-cream-50 p-5 text-sm text-maroon-800/70">
              <p className="font-semibold text-maroon-900">How styles flow to the storefront</p>
              <ol className="mt-2 space-y-1.5 list-decimal list-inside text-xs">
                <li>Create a style here (e.g. "Ethnic").</li>
                <li>Select it when adding or editing a product.</li>
                <li>The style pill automatically appears in the storefront filter bar.</li>
                <li>Renaming a style here updates every product that uses it — no manual reassignment needed.</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
