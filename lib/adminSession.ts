import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/authConstants";

const COOKIE = ADMIN_SESSION_COOKIE;

export async function setAdminSession() {
  const store = await cookies();
  store.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE)?.value === "1";
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.warn("ADMIN_PASSWORD is not set; admin login disabled.");
    return false;
  }
  return password === expected;
}
