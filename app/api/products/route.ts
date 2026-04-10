import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { dbToProduct } from "@/lib/productMapper";
import { isAdmin } from "@/lib/adminSession";
import { isCloudinaryConfigured } from "@/lib/cloudinary-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

const CATEGORIES_INCLUDE = {
  categories: { include: { category: true } },
} as const;

function parseHttpsImageUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== "https:") return null;
    return t;
  } catch {
    return null;
  }
}

/** Public catalog for storefront — only visible products, with categories */
export async function GET() {
  const rows = await prisma.product.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: "desc" },
    include: CATEGORIES_INCLUDE,
  });
  return Response.json(rows.map(dbToProduct));
}

/**
 * Create product (admin only).
 * Accepts `categoryIds` JSON array in form data for multi-category assignment.
 * Still accepts legacy `category` string for backward compat.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const style = String(form.get("style") ?? "").trim();
  if (!name || !style) {
    return Response.json({ error: "name and style are required" }, { status: 400 });
  }

  // categoryIds: new many-to-many system
  let categoryIds: string[] = [];
  try {
    const raw = String(form.get("categoryIds") ?? "[]");
    categoryIds = JSON.parse(raw) as string[];
  } catch {
    categoryIds = [];
  }

  // Legacy single-category fallback
  const legacyCategory = String(form.get("category") ?? "").trim() || null;

  type VariantIn = { color?: string; colorHex?: string; size?: string; stockQty?: number };

  let colors: string[] = [];
  let colorHex: string[] = [];
  let sizes: string[] = [];
  let mergedVariants: { color: string; colorHex: string; size: string; stockQty: number }[] = [];

  const rawVariants = String(form.get("variants") ?? "").trim();
  if (rawVariants) {
    let parsed: VariantIn[];
    try {
      parsed = JSON.parse(rawVariants) as VariantIn[];
    } catch {
      return Response.json({ error: "Invalid variants JSON" }, { status: 400 });
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return Response.json({ error: "Add at least one variant (color, size, stock)" }, { status: 400 });
    }
    const byKey = new Map<string, { color: string; colorHex: string; size: string; stockQty: number }>();
    const colorOrder: string[] = [];
    const sizeOrder: string[] = [];
    for (const v of parsed) {
      const color = String(v.color ?? "").trim();
      const size = String(v.size ?? "").trim();
      if (!color || !size) {
        return Response.json({ error: "Each variant needs a color and size" }, { status: 400 });
      }
      const hexRaw = String(v.colorHex ?? "#722F37").trim();
      const colorHexOne = /^#[0-9A-Fa-f]{6}$/.test(hexRaw) ? hexRaw : "#722F37";
      const stockQty = Math.max(0, Math.floor(Number(v.stockQty ?? 0)));
      const key = `${color}\u0000${size}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.stockQty += stockQty;
      } else {
        byKey.set(key, { color, colorHex: colorHexOne, size, stockQty });
      }
      if (!colorOrder.includes(color)) colorOrder.push(color);
      if (!sizeOrder.includes(size)) sizeOrder.push(size);
    }
    mergedVariants = Array.from(byKey.values());
    const hexByColor = new Map<string, string>();
    for (const v of mergedVariants) {
      if (!hexByColor.has(v.color)) hexByColor.set(v.color, v.colorHex);
    }
    colors = colorOrder;
    colorHex = colorOrder.map((c) => hexByColor.get(c) ?? "#722F37");
    sizes = sizeOrder;
  } else {
    try {
      colors = JSON.parse(String(form.get("colors") ?? "[]")) as string[];
      colorHex = JSON.parse(String(form.get("colorHex") ?? "[]")) as string[];
    } catch {
      return Response.json({ error: "Invalid colors JSON" }, { status: 400 });
    }
    while (colorHex.length < colors.length) colorHex.push("#722F37");
    colorHex = colorHex.slice(0, colors.length);
    try {
      sizes = JSON.parse(String(form.get("sizes") ?? "[]")) as string[];
    } catch {
      return Response.json({ error: "Invalid sizes JSON" }, { status: 400 });
    }
  }

  const nameHi = String(form.get("nameHi") ?? "").trim() || null;
  const description = String(form.get("description") ?? "").trim() || null;
  const fabric = String(form.get("fabric") ?? "").trim() || null;
  const showPrice = String(form.get("showPrice") ?? "1") === "1";
  const priceRaw = String(form.get("price") ?? "").trim();
  const price = priceRaw === "" ? null : Number(priceRaw);
  if (price !== null && (Number.isNaN(price) || price < 0)) {
    return Response.json({ error: "Invalid price" }, { status: 400 });
  }

  const badgeRaw = String(form.get("badge") ?? "").trim();
  const badge = badgeRaw === "new" || badgeRaw === "trending" ? badgeRaw : null;

  const imageUrlFromClient = parseHttpsImageUrl(String(form.get("imageUrl") ?? ""));
  let imageUrl: string | null = imageUrlFromClient;

  if (!imageUrl) {
    const file = form.get("image");
    if (file instanceof File && file.size > 0) {
      if (isCloudinaryConfigured()) {
        return Response.json(
          { error: "Upload the image first (Cloudinary is enabled). Use the admin upload step and pass imageUrl." },
          { status: 400 }
        );
      }
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.type)) {
        return Response.json({ error: "Image must be JPEG, PNG, WebP, or GIF" }, { status: 400 });
      }
      await mkdir(UPLOAD_DIR, { recursive: true });
      const ext = file.name.split(".").pop()?.toLowerCase();
      const safe =
        ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp" || ext === "gif" ? ext : "jpg";
      const filename = `${crypto.randomUUID()}.${safe}`;
      const buf = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(UPLOAD_DIR, filename), buf);
      imageUrl = `/uploads/products/${filename}`;
    }
  }

  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name,
        nameHi,
        category: legacyCategory,
        style,
        description,
        fabric,
        price,
        showPrice,
        badge,
        colors: JSON.stringify(colors.length ? colors : ["Default"]),
        colorHex: JSON.stringify(
          colorHex.length ? colorHex : (colors.length ? colors : ["Default"]).map(() => "#722F37")
        ),
        sizes: JSON.stringify(sizes.length ? sizes : ["Free Size"]),
        image: imageUrl,
        categories: categoryIds.length
          ? { create: categoryIds.map((id) => ({ categoryId: id })) }
          : undefined,
      },
      include: CATEGORIES_INCLUDE,
    });

    if (mergedVariants.length > 0) {
      await tx.variant.createMany({
        data: mergedVariants.map((v) => ({
          productId: created.id,
          color: v.color,
          colorHex: v.colorHex,
          size: v.size,
          stockQty: v.stockQty,
        })),
      });
    }

    return created;
  });

  return Response.json(dbToProduct(row), { status: 201 });
}
