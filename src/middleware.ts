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

  const redirectCount = parseInt(
    request.headers.get("X-Redirect-Count") || "0"
  );
  if (redirectCount > 2) {
    console.log("Too many redirects, returning 400");
    return new NextResponse(null, {
      status: 400,
      statusText: "Too many redirects",
    });
  }

  const authenticated = isAuthenticated(request);
  console.log("Authentication check:", authenticated);

  if (request.nextUrl.pathname.startsWith("/dashboard") && !authenticated) {
    console.log("Redirecting to auth...");
    const response = NextResponse.redirect(new URL("/auth", request.url));
    response.headers.set("X-Redirect-Count", (redirectCount + 1).toString());
    return response;
  }

  if (request.nextUrl.pathname.startsWith("/auth") && authenticated) {
    console.log("Redirecting to dashboard...");
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.headers.set("X-Redirect-Count", (redirectCount + 1).toString());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
