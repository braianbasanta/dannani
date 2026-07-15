import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  adminToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

/** POST /api/admin/login — valida la clave y abre sesión de admin. */
export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  const token = adminToken();
  if (!expected || !token) {
    return NextResponse.json(
      { error: "El panel no está configurado (falta ADMIN_PASSWORD)." },
      { status: 500 }
    );
  }

  let password = "";
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as { password?: string };
    password = typeof body.password === "string" ? body.password : "";
  } else {
    const form = await req.formData().catch(() => null);
    password = form ? String(form.get("password") ?? "") : "";
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Clave incorrecta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
