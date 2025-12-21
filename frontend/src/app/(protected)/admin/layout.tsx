"use client";

import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

/**
 * Layout cho trang Admin
 *
 * Chỉ cho phép user có role "admin" truy cập.
 * Nếu không có quyền sẽ redirect đến /unauthorized.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div>
        <Navbar />
        {children}
      </div>
    </ProtectedRoute>
  );
}
