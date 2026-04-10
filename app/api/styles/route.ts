import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public: list all styles with product counts.
 * Used by admin forms for the style selector.
 */
export async function GET() {
  const rows = await prisma.style.findMany({ orderBy: { name: "asc" } });

  // Count products per style (style is stored as a string on Product)
  const counts = await prisma.product.groupBy({
    by: ["style"],
    _count: { style: true },
  });
  const countMap = new Map(counts.map((c) => [c.style, c._count.style]));

  return Response.json(
    rows.map((r) => ({ id: r.id, name: r.name, productCount: countMap.get(r.name) ?? 0 }))
  );
}

/** Admin-only: create a new style. Body: { name } */
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

  const existing = await prisma.style.findUnique({ where: { name } });
  if (existing) return Response.json({ error: "Style already exists" }, { status: 409 });

  const style = await prisma.style.create({ data: { name } });
  return Response.json({ id: style.id, name: style.name, productCount: 0 }, { status: 201 });
}
