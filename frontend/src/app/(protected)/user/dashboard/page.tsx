import React from "react";
import Dashboard from "@/components/dashboard";
import { useUser } from "@/context/User";

export default function DashboardPage() {
  return (
    <div className="text-red-900">
      <Dashboard />
    </div>
  );
}
