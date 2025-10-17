import React from "react";
import { UserProvider } from "@/components/User";
import { ReactNode } from "react";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <UserProvider>
        <header className="bg-blue-600 text-white p-4">
          <h1 className="text-lg font-bold">Manager Dashboard</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
        {/* {children} */}
      </UserProvider>
    </div>
  );
}
