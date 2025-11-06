import React from "react";
import { UserProvider } from "@/components/User";
import { ReactNode } from "react";
import NavbarManager from "@/components/NavbarManager";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <UserProvider>
        <NavbarManager />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
        {/* {children} */}
      </UserProvider>
    </div>
  );
}
