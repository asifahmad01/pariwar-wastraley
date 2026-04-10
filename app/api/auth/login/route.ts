import { setAdminSession, verifyAdminPassword } from "@/lib/adminSession";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = typeof body.password === "string" ? body.password : "";
    if (!verifyAdminPassword(password)) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }
    await setAdminSession();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
