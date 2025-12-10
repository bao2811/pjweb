"use client";

import React, { useEffect, useState } from "react";
import { UserProvider } from "@/components/User";
import Navbar from "@/components/Navbar";
import registerWebPushAPI from "@/utils/registerwebpushapi";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pushRegistered, setPushRegistered] = useState(false);

  useEffect(() => {
    const registerPush = async () => {
      if (pushRegistered) return;
      
      console.log('🚀 Layout: Starting push registration flow...');
      
      try {
        // Call registerWebPushAPI directly - it handles all checks internally
        const result = await registerWebPushAPI();
        if (result) {
          setPushRegistered(true);
        }
      } catch (error) {
        console.error('❌ Layout: Push registration failed:', error);
      }
    };

    // Delay to ensure DOM ready and token loaded
    const timer = setTimeout(registerPush, 1500);
    return () => clearTimeout(timer);
  }, [pushRegistered]);

  return (
    <div>
      <UserProvider>
        <Navbar />
        {children}
      </UserProvider>
    </div>
  );
}
