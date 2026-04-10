import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only: update a variant's stock or active status.
 * Body: { stockQty?, isActive? }
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; variantId: string } }
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { stockQty?: number; isActive?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Expected JSON body" }, { status: 400 });
  }

  const data: Record<string, any> = {};
  if ("stockQty" in body) data.stockQty = Math.max(0, Number(body.stockQty ?? 0));
  if ("isActive" in body) data.isActive = Boolean(body.isActive);

  const variant = await prisma.variant.update({
    where: { id: params.variantId, productId: params.id },
    data,
  });
  return Response.json(variant);
}

/** Admin-only: permanently remove a variant */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; variantId: string } }
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.variant.delete({
    where: { id: params.variantId, productId: params.id },
  });
  return Response.json({ ok: true });
}
