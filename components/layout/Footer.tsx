import Link from "next/link";
import { STORE_INFO } from "@/data/products";
import { waLink } from "@/lib/utils";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gold-500/20 bg-maroon-950 text-cream-200">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-xl font-semibold text-gold-200">{STORE_INFO.nameEn}</p>
            <p className="font-hindi mt-1 text-sm text-cream-300/90">{STORE_INFO.nameHi}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream-300/80">{STORE_INFO.taglineHi}</p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <p className="font-medium text-gold-200/90">Quick links</p>
            <a href="#categories" className="text-cream-300/90 hover:text-cream">
              Categories
            </a>
            <a href="#collection" className="text-cream-300/90 hover:text-cream">
              Collection
            </a>
            <a href="#contact" className="text-cream-300/90 hover:text-cream">
              Contact
            </a>
            <Link href="/" className="text-cream-300/90 hover:text-cream">
              Home
            </Link>
            <Link href="/admin" className="text-cream-300/90 hover:text-cream">
              Admin
            </Link>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gold-200/90">Visit</p>
            <p className="mt-2 max-w-xs text-cream-300/85">{STORE_INFO.address}</p>
            <a
              href={waLink(STORE_INFO.whatsapp, "Hello! I'm interested in your clothing collection.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block font-semibold text-gold-300 underline-offset-2 hover:underline"
            >
              WhatsApp store
            </a>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-cream-400/80">
          © {year} {STORE_INFO.nameEn}. Roh, Nawada, Bihar.
        </p>
      </div>
    </footer>
  );
}
