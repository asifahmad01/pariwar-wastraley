import { cn } from "@/lib/utils";

interface BadgeProps {
  variant: "new" | "trending";
  className?: string;
}

const config = {
  new:      { label: "New Arrival", className: "bg-gold-gradient text-maroon-950" },
  trending: { label: "Trending",    className: "bg-maroon-900 text-cream-100" },
};

export default function Badge({ variant, className }: BadgeProps) {
  const { label, className: variantClass } = config[variant];
  return (
    <span
      className={cn(
        "absolute left-1.5 top-1.5 z-10 max-w-[calc(100%-0.75rem)] truncate rounded px-1.5 py-0.5 text-[0.55rem] font-bold uppercase leading-tight tracking-wide shadow-sm sm:left-3 sm:top-3 sm:max-w-none sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-[0.65rem] sm:tracking-wider",
        variantClass,
        className
      )}
    >
      {label}
    </span>
  );
}
