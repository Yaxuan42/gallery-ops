import { NextResponse } from "next/server";
import { login, logout } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const success = await login(email, password);
  if (!success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await logout();
  return NextResponse.json({ ok: true });
}
