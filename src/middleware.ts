import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/org-dashboard", "/org-events", "/org-members"];
const publicRoutes = ["/login", "/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("session")?.value || null;
  const isAuthenticated = !!token;

  if (isAuthenticated && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/org-dashboard", request.url));
  }

  if (
    !isAuthenticated &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};