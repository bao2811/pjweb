import React from "react";
import NavbarUser from "@/components/NavbarUser";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ProtectedRoute allowedRoles={["admin", "manager", "user"]}>
    <div>
      <NavbarUser />
      {children}
    </div>
    // </ProtectedRoute>
  );
}
