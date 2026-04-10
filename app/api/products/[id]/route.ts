import { prisma } from "@/lib/prisma";
import { dbToProduct } from "@/lib/productMapper";
import { isAdmin } from "@/lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIES_INCLUDE = {
  categories: { include: { category: true } },
} as const;

/** Admin-only: get a single product with its variants and categories */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      variants: { orderBy: { createdAt: "asc" } },
      ...CATEGORIES_INCLUDE,
    },
  });
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ ...dbToProduct(row), variants: row.variants });
}

/**
 * Admin-only: update product fields.
 * Accepts JSON body — only provided fields are updated.
 * Pass `categoryIds: string[]` to replace the product's category assignments.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Expected JSON body" }, { status: 400 });
  }

  const scalarFields = [
    "name", "nameHi", "category", "style", "description", "fabric",
    "price", "showPrice", "badge", "isVisible", "image",
    "colors", "colorHex", "sizes",
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};

  for (const key of scalarFields) {
    if (!(key in body)) continue;
    const val = body[key];
    if (key === "colors" || key === "colorHex" || key === "sizes") {
      if (!Array.isArray(val)) return Response.json({ error: `${key} must be an array` }, { status: 400 });
      data[key] = JSON.stringify(val);
    } else if (key === "price") {
      data[key] = val === null || val === "" ? null : Number(val);
    } else if (key === "showPrice" || key === "isVisible") {
      data[key] = Boolean(val);
    } else if (key === "badge") {
      data[key] = val === "new" || val === "trending" ? val : null;
    } else {
      data[key] = val === "" ? null : val;
    }
  }

  // Replace category assignments if categoryIds provided
  if ("categoryIds" in body && Array.isArray(body.categoryIds)) {
    const categoryIds = body.categoryIds as string[];
    // deleteMany + createMany in a transaction
    await prisma.$transaction([
      prisma.productCategory.deleteMany({ where: { productId: params.id } }),
      ...(categoryIds.length
        ? [prisma.productCategory.createMany({
            data: categoryIds.map((cId) => ({ productId: params.id, categoryId: cId })),
          })]
        : []),
    ]);
  }

  const row = await prisma.product.update({
    where: { id: params.id },
    data,
    include: CATEGORIES_INCLUDE,
  });
  return Response.json(dbToProduct(row));
}

/** Admin-only: permanently delete a product and all its variants */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.product.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
