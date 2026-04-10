import type { Product } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import Badge from "./Badge";

export interface ProductCardProps {
  product: Product;
  /** Extra root classes */
  className?: string;
  /** Hide the secondary “View” action */
  hideAction?: boolean;
}

function PlaceholderImage({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-maroon-gradient">
      <svg
        className="mb-2 h-8 w-8 text-gold-300/40 sm:mb-3 sm:h-12 sm:w-12"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="max-w-[90%] px-1 text-center font-body text-[0.65rem] leading-tight text-cream-200/60 sm:px-2 sm:text-xs">{name}</p>
    </div>
  );
}

/** Elegant circular swatches with ring + optional label for accessibility */
function ColorBadges({
  colors,
  colorHex,
}: {
  colors: string[];
  colorHex: string[];
}) {
  if (!colors.length) return null;

  return (
    <div className="hidden space-y-1.5 sm:block">
      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-maroon-800/50">Colors</p>
      <div className="flex flex-wrap gap-2" role="list" aria-label="Available colors">
        {colors.map((color, i) => (
          <div
            key={`${color}-${i}`}
            role="listitem"
            title={color}
            className="group/sw flex items-center gap-1.5 rounded-full border border-maroon-900/10 bg-cream-50/90 py-0.5 pl-0.5 pr-2 shadow-sm ring-1 ring-white/60 transition-transform duration-200 hover:-translate-y-0.5 hover:ring-gold-400/40"
          >
            <span
              className="h-6 w-6 shrink-0 rounded-full border-2 border-white shadow-md ring-1 ring-maroon-900/10 transition-transform duration-200 group-hover/sw:scale-110"
              style={{ backgroundColor: colorHex[i] ?? "#888888" }}
            />
            <span className="max-w-[min(100%,7rem)] truncate text-[0.7rem] font-medium text-maroon-900 sm:max-w-[7rem] sm:text-xs">
              {color}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SizeBadges({ sizes }: { sizes: Product["sizes"] }) {
  if (!sizes.length) return null;

  return (
    <div className="hidden space-y-1.5 sm:block">
      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-maroon-800/50">Sizes</p>
      <div className="flex flex-wrap gap-1.5" role="list" aria-label="Available sizes">
        {sizes.map((s) => (
          <span
            key={s}
            role="listitem"
            className="inline-flex min-h-[1.75rem] items-center rounded-full border border-maroon-900/12 bg-gradient-to-b from-cream-50 to-cream-100/90 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-maroon-900 shadow-sm sm:text-xs"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Reusable clothing product card: image, name, category, style, colors, sizes, optional price, new-arrival badge.
 */
export default function ProductCard({ product, className, hideAction }: ProductCardProps) {
  const {
    name,
    nameHi,
    category,
    style,
    badge,
    price,
    showPrice,
    colors,
    colorHex,
    sizes,
    image,
    fabric,
  } = product;

  const showNewBadge = badge === "new";
  const showTrendingBadge = badge === "trending";

  return (
    <article
      className={cn(
        "group/card flex w-full max-w-full flex-col overflow-hidden rounded-lg border border-gold-500/15 bg-white shadow-card",
        "transition-all duration-300 ease-out will-change-transform",
        "active:scale-[0.99] sm:rounded-xl sm:hover:-translate-y-1 sm:hover:shadow-card-hover md:rounded-3xl md:hover:-translate-y-1.5",
        className
      )}
    >
      {/* Image — Myntra-style: shorter on mobile 2-col grid; taller detail from sm+ */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-cream-200 sm:aspect-[3/4] md:aspect-[4/5]">
        {showNewBadge && <Badge variant="new" />}
        {showTrendingBadge && !showNewBadge && <Badge variant="trending" />}

        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-maroon-950/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover/card:scale-110"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage name={name} />
        )}
      </div>

      {/* Body — compact on mobile (2-col PLP); full detail from sm+ */}
      <div className="flex flex-1 flex-col gap-1.5 p-2 sm:gap-3 sm:p-4 md:p-5">
        <div>
          <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-maroon-900 sm:line-clamp-none sm:text-xl">
            {name}
          </h3>
          {nameHi && (
            <p className="mt-0.5 line-clamp-1 font-hindi text-[0.62rem] leading-tight text-maroon-700/75 sm:mt-1 sm:text-sm sm:leading-snug">
              {nameHi}
            </p>
          )}
        </div>

        <p className="line-clamp-1 text-[0.58rem] text-maroon-800/75 sm:hidden">
          {category}
          {style ? ` · ${style}` : ""}
        </p>

        <div className="hidden grid-cols-2 gap-3 text-sm sm:grid">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-maroon-800/45">Category</p>
            <p className="mt-0.5 font-medium text-maroon-900">{category}</p>
          </div>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-maroon-800/45">Style</p>
            <p className="mt-0.5 font-medium text-maroon-900">{style}</p>
          </div>
        </div>

        {fabric && (
          <p className="hidden text-xs text-maroon-800/65 sm:block">
            <span className="font-semibold text-maroon-900/80">Fabric: </span>
            {fabric}
          </p>
        )}

        <ColorBadges colors={colors} colorHex={colorHex} />
        <SizeBadges sizes={sizes} />

        <div className="mt-auto flex flex-col gap-1.5 border-t border-maroon-900/10 pt-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-3">
          <div>
            <p className="hidden text-[0.65rem] font-semibold uppercase tracking-widest text-maroon-800/45 sm:block">Price</p>
            <p className="text-base font-bold leading-tight text-maroon-900 sm:text-xl">
              {showPrice ? (
                formatPrice(price)
              ) : (
                <span className="text-sm font-bold text-maroon-800/80 sm:text-lg">Ask in store</span>
              )}
            </p>
          </div>
          {!hideAction && (
            <button
              type="button"
              className="flex min-h-[32px] w-full shrink-0 items-center justify-center rounded-full border border-maroon-900/25 bg-maroon-900/[0.04] px-2 py-1 text-[0.65rem] font-semibold text-maroon-900 transition-colors hover:bg-maroon-900 hover:text-cream sm:min-h-[44px] sm:w-auto sm:px-4 sm:py-2 sm:text-xs"
              aria-label={`View details for ${name}`}
            >
              View
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
