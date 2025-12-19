import React from "react";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
