import NavbarAdmin from "@/components/NavbarAdmin";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ProtectedRoute allowedRoles={["admin"]}>
    <div>
      <NavbarAdmin />
      {children}
    </div>
    // </ProtectedRoute>
  );
}
