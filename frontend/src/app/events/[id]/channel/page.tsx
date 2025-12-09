"use client";
import { use } from "react";
import Group from "@/components/group_event";

export default function GroupEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // ✅ Dùng use() để unwrap
  return <Group eventId={id} role="user" />;
}
