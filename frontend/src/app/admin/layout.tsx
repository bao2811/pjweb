import NavbarAdmin from "@/components/NavbarAdmin";
import { UserProvider } from "@/components/User";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <UserProvider>
        <NavbarAdmin />
        {children}
      </UserProvider>
    </div>
  );
}
