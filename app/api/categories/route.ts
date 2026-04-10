import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public: list all categories with their product counts.
 * Used by admin forms and the storefront to drive the category filter.
 */
export async function GET() {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return Response.json(
    rows.map((r) => ({ id: r.id, name: r.name, productCount: r._count.products }))
  );
}

/** Admin-only: create a new category. Body: { name } */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string };
  try { body = await req.json(); } catch {
    return Response.json({ error: "Expected JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (!name) return Response.json({ error: "name is required" }, { status: 400 });

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return Response.json({ error: "Category already exists" }, { status: 409 });

  const category = await prisma.category.create({ data: { name } });
  return Response.json({ id: category.id, name: category.name, productCount: 0 }, { status: 201 });
}
