"use client";

import { useState } from "react";
import Link from "next/link";
import { STORE_INFO } from "@/data/products";
import { cn, waLink } from "@/lib/utils";

const nav = [
  { href: "#categories", label: "Categories" },
  { href: "#collection", label: "Collection" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gold-500/20 bg-cream/95 backdrop-blur-md supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-6">
        <Link href="/" className="flex min-w-0 flex-1 flex-col leading-none">
          <span className="font-display truncate text-base font-black tracking-wide text-maroon-900 sm:text-xl">
            {STORE_INFO.nameEn}
          </span>
          <span className="font-hindi truncate text-[0.7rem] text-maroon-800/70 sm:text-xs">{STORE_INFO.nameHi}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-maroon-950/90 transition hover:text-maroon-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={waLink(STORE_INFO.whatsapp, "Hello! I'm interested in your clothing collection.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold hidden px-4 py-2 text-xs sm:inline-flex"
          >
            WhatsApp
          </a>
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-maroon-900/20 bg-maroon-900 px-3 text-xs font-semibold text-cream md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-gold-500/15 bg-cream px-4 py-3 md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-2" aria-label="Mobile">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg py-2 text-sm font-medium text-maroon-950"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href={waLink(STORE_INFO.whatsapp, "Hello! I'm interested in your clothing collection.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold mt-2 w-full justify-center text-xs"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
