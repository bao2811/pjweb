import React from "react";
import Dashboard from "@/components/dashboard";
import { useUser } from "@/context/User";

export default function ManagerDashboard() {
  const { user } = useUser();

  if (!user || user.role !== "manager") {
    return null;
  }

  return <Dashboard />;
}
