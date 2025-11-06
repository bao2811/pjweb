"use client";
import { use } from "react";
import Group from "@/components/group_event";

export default function ManagerGroupEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  return <Group eventId={eventId} role="user" />;
}
