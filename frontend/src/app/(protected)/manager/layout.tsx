"use client";

import React from "react";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

/**
 * Layout cho trang Manager
 *
 * Chỉ cho phép user có role "manager" truy cập.
 * Nếu không có quyền sẽ redirect đến /unauthorized.
 */
export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["manager"]}>
      <Navbar />
      {children}
    </ProtectedRoute>
  );
}
