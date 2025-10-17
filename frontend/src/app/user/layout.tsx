import React from "react";
import NavbarUser from "@/components/NavbarUser";
import { UserProvider } from "@/components/User";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <UserProvider>
        <NavbarUser />
        {children}
      </UserProvider>
    </div>
  );
}
