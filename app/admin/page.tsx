"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";

/** Only allow same-origin admin paths after login (blocks `//evil` open redirects). */
function safeAdminNext(next: string | null): string | null {
  if (!next || !next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  if (next === "/admin" || next.startsWith("/admin/")) return next;
  return null;
}

type AdminProduct = Product & { variantCount: number };

export default function AdminDashboard() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadProducts = useCallback(() => {
    fetch("/api/admin/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setProducts(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setAuthed(!!d.ok);
        if (d.ok) loadProducts();
      })
      .catch(() => setAuthed(false));
  }, [loadProducts]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: loginPassword }),
    });
    if (!res.ok) { setLoginError("Invalid password."); return; }
    setAuthed(true);
    setLoginPassword("");
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const dest = safeAdminNext(params.get("next"));
    if (dest && dest !== "/admin") {
      router.replace(dest);
      return;
    }
    loadProducts();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
    setProducts([]);
  };

  const toggleVisibility = async (product: AdminProduct) => {
    setTogglingId(product.id);
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !product.isVisible }),
      });
      loadProducts();
    } finally {
      setTogglingId(null);
    }
  };

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-maroon-800/60">Checking session…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-cream px-4 py-16">
        <h1 className="font-display text-center text-2xl font-semibold text-maroon-900">
          Admin Login
        </h1>
        <p className="mt-2 text-center text-sm text-maroon-800/60">
          Pariwar Wastraley — परिवार वस्त्रालय
        </p>
        <form
          onSubmit={login}
          className="mt-8 space-y-4 rounded-2xl border border-gold-500/20 bg-white p-6 shadow-card"
        >
          <div>
            <label htmlFor="pw" className="text-xs font-bold uppercase tracking-widest text-maroon-800/60">
              Password
            </label>
            <input
              id="pw"
              type="password"
              autoComplete="current-password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-maroon-900/15 bg-cream-100 px-3 py-2.5 text-sm"
              required
            />
          </div>
          {loginError && <p className="text-sm text-red-700">{loginError}</p>}
          <button type="submit" className="btn-gold w-full justify-center">
            Sign in
          </button>
        </form>
        <Link href="/" className="mt-6 block text-center text-sm text-maroon-800 underline">
          ← Back to store
        </Link>
      </div>
    );
  }

  const visible = products.filter((p) => p.isVisible).length;
  const hidden = products.length - visible;

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gold-500/20 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-maroon-900">
              Pariwar Admin
            </h1>
            <p className="text-xs text-maroon-800/50">परिवार वस्त्रालय</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-full border border-maroon-900/20 px-3 py-1.5 text-xs font-semibold text-maroon-900">
              View Store
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-maroon-900/20 px-3 py-1.5 text-xs font-semibold text-maroon-900"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pt-8">
        {/* Stats bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4 text-sm">
            <span className="font-semibold text-maroon-900">{products.length} products</span>
            <span className="text-emerald-700">{visible} visible</span>
            {hidden > 0 && <span className="text-amber-700">{hidden} hidden</span>}
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/taxonomy"
              className="rounded-full border border-maroon-900/20 px-4 py-2 text-sm font-semibold text-maroon-900 hover:bg-cream-100"
            >
              Categories & Styles
            </Link>
            <Link
              href="/admin/products/new"
              className="btn-gold px-5 py-2 text-sm"
            >
              + Add Product
            </Link>
          </div>
        </div>

        {/* Product list */}
        {products.length === 0 ? (
          <div className="rounded-2xl border border-gold-500/20 bg-white p-12 text-center">
            <p className="text-maroon-800/60">No products yet.</p>
            <Link href="/admin/products/new" className="mt-4 inline-block text-sm font-semibold text-maroon-900 underline">
              Add your first product →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 rounded-2xl border border-gold-500/15 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-card"
              >
                {/* Thumbnail */}
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl text-maroon-900/20">
                      ✦
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-maroon-900 truncate">{product.name}</span>
                    {product.nameHi && (
                      <span className="font-hindi text-xs text-maroon-800/50">{product.nameHi}</span>
                    )}
                    {product.badge === "new" && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        New
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-maroon-800/60">
                    <span>{product.category}</span>
                    <span>·</span>
                    <span>{product.style}</span>
                    <span>·</span>
                    <span>{product.variantCount} variant{product.variantCount !== 1 ? "s" : ""}</span>
                    {product.showPrice && product.price > 0 && (
                      <>
                        <span>·</span>
                        <span>₹{product.price}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      product.isVisible
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {product.isVisible ? "Visible" : "Hidden"}
                  </span>
                  <button
                    type="button"
                    title={product.isVisible ? "Hide from store" : "Show in store"}
                    disabled={togglingId === product.id}
                    onClick={() => toggleVisibility(product)}
                    className="rounded-lg border border-maroon-900/15 px-2.5 py-1.5 text-xs font-medium text-maroon-900 transition-colors hover:bg-cream-100 disabled:opacity-50"
                  >
                    {product.isVisible ? "Hide" : "Show"}
                  </button>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="rounded-lg border border-maroon-900/15 px-2.5 py-1.5 text-xs font-medium text-maroon-900 transition-colors hover:bg-cream-100"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
