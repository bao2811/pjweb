import React from "react";
import { ReactNode } from "react";
import NavbarManager from "@/components/NavbarManager";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <div className="flex flex-col h-screen">
        <NavbarManager />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
