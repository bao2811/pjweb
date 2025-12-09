"use client";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ChatProps {
  groupId: number; // truyền vào id nhóm
}

export default function Chat({ groupId }: ChatProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

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

    // mỗi nhóm lắng nghe kênh riêng
    const channel = pusher.subscribe(`chat.${groupId}`);

    channel.bind("ChatMessage", (data: { message: string }) => {
      setMessages((prev) => [...prev, data.message]);
    });

    return () => {
      pusher.unsubscribe(`chat.${groupId}`);
      pusher.disconnect();
    };
  }, [groupId]);

  async function sendMessage() {
    await fetch(`${API_URL}/api/groups/${groupId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    setInput("");
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Chat nhóm {groupId}</h2>
      <ul className="mb-4">
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="border px-2 py-1 flex-1"
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4">
          Gửi
        </button>
      </div>
    </div>
  );
}
