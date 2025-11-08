"use client";

import React from "react";
import DashBoard from "@/components/dashboard";

export default function AdminDashboardPage() {
  const user = localStorage.getItem("user");
  if (!user || JSON.parse(user).role !== "admin") {
    return null;
  }

  return (
    <div>
      <DashBoard />
      {/* Admin dashboard content goes here */}
    </div>
  );
}
