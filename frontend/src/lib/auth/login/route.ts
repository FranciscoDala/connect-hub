import { NextResponse } from "next/server";

const ADMIN = { email: "admin@connect.ao", password: "admin123" };

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (email === ADMIN.email && password === ADMIN.password) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("connect_admin", "autenticado", { httpOnly: true, path: "/", maxAge: 60*60*24 });
    return res;
  }
  return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
}
