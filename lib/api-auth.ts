import { NextRequest, NextResponse } from "next/server";

/**
 * Validate Bearer token for admin API endpoints.
 * Returns null if auth passes, or a 401 NextResponse if it fails.
 */
export function requireApiAuth(request: NextRequest): NextResponse | null {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token || token !== process.env.ADMIN_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
