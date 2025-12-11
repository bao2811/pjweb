import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Decode JWT token (simplified for middleware)
function decodeToken(token: string): any {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return payload;
  } catch (error) {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch (error) {
    return true;
  }
}

export async function middleware(req: NextRequest) {
  // const url = req.nextUrl.clone();
  // const pathname = url.pathname;

  // // Get token from cookie or Authorization header
  // const token =
  //   req.cookies.get("auth_token")?.value ||
  //   req.headers.get("Authorization")?.replace("Bearer ", "");
  // const refreshToken = req.cookies.get("refresh_token")?.value || "";

  // // Routes that require authentication
  // const protectedRoutes = ["/admin", "/manager", "/user"];
  // const isProtectedRoute = protectedRoutes.some((route) =>
  //   pathname.startsWith(route)
  // );

  // // If accessing protected route
  // if (isProtectedRoute) {
  //   // Check if token exists
  //   // If access token exists and is still valid -> allow
  //   if (token && !isTokenExpired(token)) {
  //     return NextResponse.next();
  //   }

  //   // At this point access token is missing or expired.
  //   // Try to use refresh token to obtain a new access token.
  //   if (!refreshToken) {
  //     // No refresh token -> require full login
  //     url.pathname = "/home/login";
  //     url.searchParams.set("redirect", pathname);
  //     url.searchParams.set("message", "login_required");
  //     return NextResponse.redirect(url);
  //   }

  //   // If refresh token is a JWT we can check expiry locally; if it's opaque, attempt backend refresh
  //   try {
  //     const rtPayload = decodeToken(refreshToken);
  //     if (rtPayload && rtPayload.exp) {
  //       if (isTokenExpired(refreshToken)) {
  //         url.pathname = "/home/login";
  //         url.searchParams.set("redirect", pathname);
  //         url.searchParams.set("message", "session_expired");
  //         return NextResponse.redirect(url);
  //       }
  //     }
  //     // if decodeToken returned null, assume opaque refresh token and try backend refresh below
  //   } catch (e) {
  //     // ignore and attempt backend refresh
  //   }

  //   // Attempt to refresh tokens by calling backend refresh endpoint
  //   try {
  //     // Backend URL - try common env vars, fallback to localhost
  //     const API_URL =
  //       process.env.NEXT_PUBLIC_API_URL ||
  //       process.env.API_URL ||
  //       "http://localhost:8000";

  //     const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ refresh_token: refreshToken }),
  //     });

  //     if (!refreshRes.ok) {
  //       // Refresh failed -> force login
  //       url.pathname = "/home/login";
  //       url.searchParams.set("redirect", pathname);
  //       url.searchParams.set("message", "session_expired");
  //       return NextResponse.redirect(url);
  //     }

  //     const data = await refreshRes.json();
  //     const newAccessToken = data.access_token || data.token || data.auth_token;
  //     const newRefreshToken = data.refresh_token || data.refreshToken || null;

  //     if (!newAccessToken) {
  //       // Backend did not return a new access token -> require login
  //       url.pathname = "/home/login";
  //       url.searchParams.set("redirect", pathname);
  //       url.searchParams.set("message", "session_expired");
  //       return NextResponse.redirect(url);
  //     }

  //     // Set cookies with new tokens and allow request
  //     const res = NextResponse.next();
  //     // Access token: short lived (1 hour)
  //     res.cookies.set("auth_token", newAccessToken, {
  //       httpOnly: true,
  //       path: "/",
  //       sameSite: "lax",
  //       maxAge: 60 * 60, // 1 hour
  //     });
  //     // If backend returned a new refresh token, update it (7 days)
  //     if (newRefreshToken) {
  //       res.cookies.set("refresh_token", newRefreshToken, {
  //         httpOnly: true,
  //         path: "/",
  //         sameSite: "lax",
  //         maxAge: 7 * 24 * 60 * 60, // 7 days
  //       });
  //     }

  //     return res;
  //   } catch (err) {
  //     // Any error during refresh -> require login
  //     url.pathname = "/home/login";
  //     url.searchParams.set("redirect", pathname);
  //     url.searchParams.set("message", "session_expired");
  //     return NextResponse.redirect(url);
  //   }
  // }

  // // Allow access to public routes
  return NextResponse.next();
}

// // Apply middleware to specific routes
export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/user/:path*",
    "/login",
    "/register",
  ],
};
