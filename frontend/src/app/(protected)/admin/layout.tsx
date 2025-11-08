import NavbarAdmin from "@/components/NavbarAdmin";
import { UserProvider } from "@/context/User";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <NavbarAdmin />
      {children}
    </div>
  );
}
