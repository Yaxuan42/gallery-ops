import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "gallery_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

// Create a simple session token (base64url encoded JSON with email + expiry)
function createToken(email: string): string {
  const payload = JSON.stringify({
    email,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  return Buffer.from(payload).toString("base64url");
}

function parseToken(token: string): { email: string; exp: number } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return false;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return false;

  const token = createToken(email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return parseToken(token);
}

export async function requireAuth(): Promise<{ email: string }> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
