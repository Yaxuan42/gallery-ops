import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes: check auth cookie
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("gallery_session")?.value;
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Login page: pass through (no middleware processing needed)
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // API routes: pass through
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // All other routes: delegate to next-intl middleware for i18n routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except static files and _next internals
    "/((?!_next/static|_next/image|uploads|favicon.ico).*)",
  ],
};
