import React from "react";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4">{children}</main>
    </div>
  );
}
