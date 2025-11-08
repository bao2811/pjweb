"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
