import React from "react";
import NavbarUser from "@/components/NavbarUser";
import { UserProvider } from "@/context/User";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <NavbarUser />
      {children}
    </div>
  );
}
