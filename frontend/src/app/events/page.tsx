"use client";

import Events from "@/components/events";
import Navbar from "@/components/Navbar";
import React, { useEffect } from "react";
import registerWebPushAPI from "@/utils/registerwebpushapi";

export default function EventsPage() {
  useEffect(() => {
    console.log("🔥 EventsPage mounted - calling registerWebPushAPI");
    registerWebPushAPI();
  }, []);

  return (
    <>
      <Navbar />
      <Events />
    </>
  );
}
