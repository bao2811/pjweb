// app/admin/layout.tsx
"use client";
import { AuthProvider } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/components/dashboard";

function Inner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) router.replace("/home/login");
      else if (!hasRole("admin")) router.replace("/403"); // page No Permission
    }
  }, [isAuthenticated, isLoading, hasRole, router]);

  if (isLoading || !isAuthenticated || !hasRole("admin"))
    return <p>Loading...</p>;

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Dashboard />;
}
