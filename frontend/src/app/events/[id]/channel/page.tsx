"use client";
import { use } from "react";
import Group from "@/components/group_event";

export default function GroupEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <Group eventId={id} role="user" />;
}
