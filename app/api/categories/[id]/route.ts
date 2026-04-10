import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: rename a category. Body: { name } */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string };
  try { body = await req.json(); } catch {
    return Response.json({ error: "Expected JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (!name) return Response.json({ error: "name is required" }, { status: 400 });

  const conflict = await prisma.category.findFirst({
    where: { name, NOT: { id: params.id } },
  });
  if (conflict) return Response.json({ error: "Another category with that name already exists" }, { status: 409 });

  const category = await prisma.category.update({
    where: { id: params.id },
    data: { name },
    include: { _count: { select: { products: true } } },
  });

  return Response.json({ id: category.id, name: category.name, productCount: category._count.products });
}

/**
 * Admin-only: delete a category.
 * Blocked if any products are assigned to it (productCount > 0).
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await prisma.productCategory.count({ where: { categoryId: params.id } });
  if (count > 0) {
    return Response.json(
      { error: `Cannot delete: ${count} product${count > 1 ? "s are" : " is"} assigned to this category. Unassign them first.` },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
