import { isAdmin } from "@/lib/adminSession";

export async function GET() {
  return Response.json({ ok: await isAdmin() });
}
