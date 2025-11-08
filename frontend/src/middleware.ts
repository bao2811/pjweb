import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Lấy token hoặc user từ cookie (cách phổ biến nhất)
  const user = req.cookies.get("user")?.value;
  console.log("Cookies:", user);
  if (!user) {
    url.pathname = "/home/login";
    return NextResponse.redirect(url);
  }

  let parsedUser;
  try {
    parsedUser = JSON.parse(user);
  } catch (err) {
    url.pathname = "/home/login";
    return NextResponse.redirect(url);
  }

  console.log(parsedUser);

  // Nếu là user thường mà vào admin
  if (url.pathname.startsWith("/admin") && parsedUser.role !== "admin") {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  // Nếu là admin mà vào user
  if (url.pathname.startsWith("/manager") && parsedUser.role !== "manager") {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  // Nếu là admin mà vào user
  if (url.pathname.startsWith("/user") && parsedUser.role !== "user") {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  // Cho phép truy cập nếu hợp lệ
  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các route cần bảo vệ
export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/manager/:path*"],
};
