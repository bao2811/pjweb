"use client";

import { useEffect, useRef } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}

interface UseReverbChannelOptions {
  groupId: number | string | null;
  authToken: string | null;
  onMessage?: (payload: any) => void;
  onMemberJoined?: (payload: any) => void;
  onMemberLeft?: (payload: any) => void;
  onEvent?: (eventName: string, payload: any) => void; // generic handler for other events
}

/**
 * Hook to subscribe to a private Reverb channel for a group: `group.{id}`
 *
 * Usage:
 *   useReverbChannel({ groupId, authToken, onMessage, ... })
 *
 * It mirrors `useReverbNotification` style and requires the same env vars
 */
export function useReverbChannel({
  groupId,
  authToken,
  onMessage,
  onMemberJoined,
  onMemberLeft,
  onEvent,
}: UseReverbChannelOptions) {
  const onMessageRef = useRef(onMessage);
  const onMemberJoinedRef = useRef(onMemberJoined);
  const onMemberLeftRef = useRef(onMemberLeft);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  useEffect(() => {
    onMemberJoinedRef.current = onMemberJoined;
  }, [onMemberJoined]);
  useEffect(() => {
    onMemberLeftRef.current = onMemberLeft;
  }, [onMemberLeft]);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!groupId || !authToken) {
      console.log(
        "⚠️ [Reverb] Missing groupId or authToken, skipping group channel connect"
      );
      return;
    }

    console.log("🚀 [Reverb] Initializing Echo for group:", groupId);

    window.Pusher = Pusher;

    const echo = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
      wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
      forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      },
    });

    window.Echo = echo;

    const channelName = `group.${groupId}`;
    console.log("📡 [Reverb] Subscribing to group channel:", channelName);

    const channel = echo.private(channelName);

    channel.subscribed(() => {
      console.log("🟢 [Reverb] Subscribed to", channelName);
    });

    channel.error((error: any) => {
      console.error("❌ [Reverb] Group channel error:", error);
    });

    // Common event: new chat/message in group
    channel.listen(".group.message", (data: any) => {
      console.log("📨 [Reverb] group.message:", data);
      if (onMessageRef.current) onMessageRef.current(data);
    });

    // Member joined/left events (convention: member.joined, member.left)
    channel.listen(".member.joined", (data: any) => {
      console.log("➕ [Reverb] member.joined:", data);
      if (onMemberJoinedRef.current) onMemberJoinedRef.current(data);
    });

    channel.listen(".member.left", (data: any) => {
      console.log("➖ [Reverb] member.left:", data);
      if (onMemberLeftRef.current) onMemberLeftRef.current(data);
    });

    // Generic handler for any other server-sent events you want to catch.
    // If your server emits named events, list them here or use this generic
    // listener pattern by adding additional .listen calls in the future.
    channel.listen(".group.updated", (data: any) => {
      console.log("🔁 [Reverb] group.updated:", data);
      if (onEventRef.current) onEventRef.current("group.updated", data);
    });

    return () => {
      console.log("🔌 [Reverb] Leaving group channel:", channelName);
      echo.leave(channelName);
      echo.disconnect();
    };
  }, [groupId, authToken]);
}
