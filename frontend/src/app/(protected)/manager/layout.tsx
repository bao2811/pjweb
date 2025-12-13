import React from "react";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      {children}
    </div>
  );
}
