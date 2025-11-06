import React from "react";
import { UserProvider } from "@/components/User";
import NavbarUser from "@/components/NavbarUser"

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
