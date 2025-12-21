"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

/**
 * Layout cho trang User
 *
 * Chỉ cho phép user có role "user" truy cập.
 * Nếu không có quyền sẽ redirect đến /unauthorized.
 */
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <div>
        <Navbar />
        {children}
      </div>
    </ProtectedRoute>
  );
}
