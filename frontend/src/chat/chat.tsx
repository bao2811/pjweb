"use client";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export default function Chat() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
    if (!key) {
      console.warn("Missing NEXT_PUBLIC_REVERB_APP_KEY — skipping Pusher init");
      return;
    }

    const wsHost = process.env.NEXT_PUBLIC_REVERB_HOST ?? "127.0.0.1";
    const wsPort = parseInt(process.env.NEXT_PUBLIC_REVERB_PORT ?? "8080", 10);

    const pusher = new Pusher(key, {
      cluster: "",
      wsHost,
      wsPort,
      forceTLS: false,
      enabledTransports: ["ws"],
    });

    const channel = pusher.subscribe("chat");
    channel.bind("ChatMessage", (data: { message: string }) => {
      setMessages((prev) => [...prev, data.message]);
    });

    return () => {
      pusher.unsubscribe("chat");
      pusher.disconnect();
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Chat</h2>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
