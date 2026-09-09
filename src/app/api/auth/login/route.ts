import { NextResponse } from "next/server";
import { applyTokenCookies, backendUrl, readJsonSafe } from "@/lib/server/backend";

export async function POST(request: Request) {
  const input = await request.json() as { email?: string; password?: string; remember?: boolean };
  const upstream = await fetch(backendUrl("auth/login"), { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email: input.email, password: input.password }), cache: "no-store" });
  const data = await readJsonSafe(upstream);
  if (!upstream.ok) return NextResponse.json(data ?? { message: "Đăng nhập thất bại" }, { status: upstream.status });
  const tokens = data as { accessToken: string; refreshToken: string; expiresIn: number; user: unknown };
  const response = NextResponse.json({ user: tokens.user, expiresIn: tokens.expiresIn });
  applyTokenCookies(response, tokens, input.remember !== false);
  return response;
}
