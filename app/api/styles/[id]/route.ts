import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: rename a style. Body: { name } */
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

  const current = await prisma.style.findUnique({ where: { id: params.id } });
  if (!current) return Response.json({ error: "Not found" }, { status: 404 });

  const conflict = await prisma.style.findFirst({ where: { name, NOT: { id: params.id } } });
  if (conflict) return Response.json({ error: "Another style with that name already exists" }, { status: 409 });

  // Also rename the style string on all products that use the old name
  await prisma.$transaction([
    prisma.style.update({ where: { id: params.id }, data: { name } }),
    prisma.product.updateMany({ where: { style: current.name }, data: { style: name } }),
  ]);

  const productCount = await prisma.product.count({ where: { style: name } });
  return Response.json({ id: params.id, name, productCount });
}

/**
 * Admin-only: delete a style.
 * Blocked if any products still reference this style name.
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const style = await prisma.style.findUnique({ where: { id: params.id } });
  if (!style) return Response.json({ error: "Not found" }, { status: 404 });

  const count = await prisma.product.count({ where: { style: style.name } });
  if (count > 0) {
    return Response.json(
      { error: `Cannot delete: ${count} product${count > 1 ? "s use" : " uses"} this style. Reassign them first.` },
      { status: 409 }
    );
  }

  await prisma.style.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
