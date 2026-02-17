import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const protectedPaths = [
    "/dashboard",
    "/inventory",
    "/marketplace",
    "/deck-builder",
  ];
  const authToken = request.cookies.get("authToken")?.value;
  const secret = new TextEncoder().encode(process.env.SECRET_KEY);
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );
  if (isProtectedPath) {
    if (!authToken) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    try {
      await jwtVerify(authToken, secret);
      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("authToken");
      return response;
    }
  }
  if (!isProtectedPath && authToken) {
    try {
      await jwtVerify(authToken, secret);
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    } catch (error) {
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/:path*",
    "/deck-builder/:path*",
    "/marketplace/:path*",
    "/login",
    "/register",
    "/onboarding",
  ],
};
