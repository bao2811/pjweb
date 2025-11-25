"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    if (user) {
      // Redirect to appropriate dashboard based on role
      const dashboards: Record<string, string> = {
        admin: "/admin/dashboard",
        manager: "/manager/dashboard",
        user: "/user/dashboard",
      };
      router.push(dashboards[user.role] || "/");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Content */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600 mb-8">
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị
            viên nếu bạn cho rằng đây là lỗi.
          </p>

          {/* User info */}
          {user && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-left">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Đăng nhập với:</span>{" "}
                {user.email}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <span className="font-semibold">Vai trò:</span>{" "}
                {user.role === "admin"
                  ? "Quản trị viên"
                  : user.role === "manager"
                  ? "Quản lý"
                  : "Người dùng"}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg transition-all shadow-lg"
            >
              Về trang chủ
            </button>
            <button
              onClick={handleGoBack}
              className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
            >
              Quay lại
            </button>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full px-6 py-3 bg-white hover:bg-gray-50 text-red-600 font-medium rounded-lg border border-red-200 transition-all"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
