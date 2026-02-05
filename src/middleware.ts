import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/"];
const level1and2Routes = ["/org-dashboard", "/org-events", "/org-members"];
const level3Routes = ["/admin-dashboard", "/admin-students", "/admin-organization"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("session")?.value || null;
  const accessLevel = request.cookies.get("accessLevel")?.value || null;
  const isAuthenticated = !!token;

  if(isAuthenticated && publicRoutes.includes(pathname)) {
    if (accessLevel === "3") {
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/org-dashboard", request.url));
    } 
  }

  const isProtectedRoute = level1and2Routes.some((route) => pathname.startsWith(route)) ||
    level3Routes.some((route) => pathname.startsWith(route));
  
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated) {
    if (level3Routes.some(route => pathname.startsWith(route))) {
      if (accessLevel !== "3") {
        return NextResponse.redirect(new URL("/org-dashboard", request.url));
      }
    }
    else if (level1and2Routes.some(route => pathname.startsWith(route))) {
      if (accessLevel !== "2" && accessLevel !== "1") {
        return NextResponse.redirect(new URL("/admin-dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};