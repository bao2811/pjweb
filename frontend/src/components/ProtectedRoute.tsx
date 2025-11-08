"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/User";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/home/login"); // ← dấu / bắt đầu URL tuyệt đối
    }
  }, [user, loading, router]);

  if (loading) return <div>Đang kiểm tra phiên đăng nhập...</div>;

  return <>{children}</>;
};
