import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: list all variants for a product */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const variants = await prisma.variant.findMany({
    where: { productId: params.id },
    orderBy: { createdAt: "asc" },
  });
  return Response.json(variants);
}

/**
 * Admin-only: add a new variant to a product.
 * Body: { color, colorHex, size, stockQty }
 * color+size must be unique per product.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { color?: string; colorHex?: string; size?: string; stockQty?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Expected JSON body" }, { status: 400 });
  }

  const color = String(body.color ?? "").trim();
  const size = String(body.size ?? "").trim();
  if (!color || !size) {
    return Response.json({ error: "color and size are required" }, { status: 400 });
  }

  const colorHex = String(body.colorHex ?? "#722F37").trim();
  const stockQty = Math.max(0, Number(body.stockQty ?? 0));

  // Upsert: if variant already exists, just update stock and re-activate
  const variant = await prisma.variant.upsert({
    where: { productId_color_size: { productId: params.id, color, size } },
    create: { productId: params.id, color, colorHex, size, stockQty, isActive: true },
    update: { stockQty, isActive: true, colorHex },
  });

  return Response.json(variant, { status: 201 });
}
