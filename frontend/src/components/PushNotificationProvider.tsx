"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import registerWebPushAPI from "@/utils/registerwebpushapi";

export default function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  useEffect(() => {
    // Only register for push notifications if user is logged in
    if (user) {
      registerWebPushAPI();
    }
  }, [user]);

  return <>{children}</>;
}
