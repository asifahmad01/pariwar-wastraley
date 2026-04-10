import { prisma } from "@/lib/prisma";
import { dbToProduct } from "@/lib/productMapper";
import { isAdmin } from "@/lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: returns all products (including hidden) with variant counts */
export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { variants: true } },
      categories: { include: { category: true } },
    },
  });

  return Response.json(
    rows.map((row) => ({
      ...dbToProduct(row),
      variantCount: row._count.variants,
    }))
  );
}
