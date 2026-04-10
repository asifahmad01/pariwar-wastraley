export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number): string {
  return "₹" + price.toLocaleString("en-IN");
}

export function waLink(digits: string, message?: string): string {
  const n = digits.replace(/\D/g, "");
  if (!n) return "#";
  const base = `https://wa.me/${n}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
