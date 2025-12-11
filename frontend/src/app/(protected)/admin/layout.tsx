import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ProtectedRoute allowedRoles={["admin"]}>
    <div>
      <Navbar />
      {children}
    </div>
    // </ProtectedRoute>
  );
}
