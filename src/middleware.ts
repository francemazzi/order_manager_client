import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  exp: number;
  sub: number;
}

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get("token")?.value;
  console.log("Token in middleware:", token);

  if (!token) {
    console.log("No token found in middleware");
    return false;
  }

  try {
    const decodedToken = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    const isValid = decodedToken.exp > currentTime;

    console.log("Token expiration:", new Date(decodedToken.exp * 1000));
    console.log("Current time:", new Date(currentTime * 1000));
    console.log("Token is valid:", isValid);

    return isValid;
  } catch (error) {
    console.error("Error in middleware:", error);
    return false;
  }
}

export function middleware(request: NextRequest) {
  console.log("Middleware called for path:", request.nextUrl.pathname);

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const authenticated = isAuthenticated(request);
    console.log("Authentication check for dashboard:", authenticated);

    if (!authenticated) {
      console.log("Redirecting to auth...");
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith("/auth")) {
    const authenticated = isAuthenticated(request);
    console.log("Authentication check for auth:", authenticated);

    if (authenticated) {
      console.log("Redirecting to dashboard...");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
