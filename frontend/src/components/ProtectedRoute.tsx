"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Props cho component ProtectedRoute
 */
interface ProtectedRouteProps {
  /** Nội dung con cần bảo vệ */
  children: React.ReactNode;
  /** Danh sách các role được phép truy cập */
  allowedRoles: string[];
  /** URL redirect khi không có quyền (mặc định: /unauthorized) */
  redirectUrl?: string;
}

/**
 * Component ProtectedRoute - Bảo vệ route theo role
 *
 * Kiểm tra xem user hiện tại có role phù hợp để truy cập route hay không.
 * Nếu không có quyền, redirect đến trang unauthorized.
 *
 * @example
 * ```tsx
 * <ProtectedRoute allowedRoles={["admin"]}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectUrl = "/unauthorized",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Chờ cho đến khi authentication check hoàn tất
    if (isLoading) {
      return;
    }

    // Nếu chưa đăng nhập, redirect về login
    if (!isAuthenticated) {
      router.replace("/home/login");
      return;
    }

    // Kiểm tra quyền truy cập theo role
    if (user) {
      const hasPermission = allowedRoles.includes(user.role);

      if (!hasPermission) {
        // Không có quyền - redirect đến trang unauthorized
        console.warn(
          `[ProtectedRoute] User role "${
            user.role
          }" không có quyền truy cập. Allowed roles: ${allowedRoles.join(", ")}`
        );
        router.replace(redirectUrl);
        return;
      }

      // Có quyền truy cập
      setIsAuthorized(true);
    }

    setIsChecking(false);
  }, [isLoading, isAuthenticated, user, allowedRoles, redirectUrl, router]);

  // Hiển thị loading khi đang kiểm tra
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Chưa xác thực hoặc không có quyền
  if (!isAuthenticated || !isAuthorized) {
    return null;
  }

  // Có quyền - render children
  return <>{children}</>;
}

/**
 * Component AdminRoute - Shortcut cho route chỉ dành cho Admin
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>;
}

/**
 * Component ManagerRoute - Shortcut cho route chỉ dành cho Manager
 */
export function ManagerRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["manager"]}>{children}</ProtectedRoute>;
}

/**
 * Component UserRoute - Shortcut cho route chỉ dành cho User
 */
export function UserRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["user"]}>{children}</ProtectedRoute>;
}

/**
 * Component AdminOrManagerRoute - Shortcut cho route dành cho Admin hoặc Manager
 */
export function AdminOrManagerRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;
