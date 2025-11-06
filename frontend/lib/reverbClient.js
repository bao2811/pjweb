import Pusher from "pusher-js";

export const reverb = new Pusher(process.env.NEXT_PUBLIC_REVERB_APP_KEY, {
  wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "127.0.0.1",
  wsPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
  forceTLS: false,
  enabledTransports: ["ws"],
});
