self.addEventListener("push", function (event) {
  console.log("🔔 Push received:", event);

  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
      console.log("📦 Push data:", data);
    }
  } catch (e) {
    console.error("❌ Failed to parse push data:", e);
  }

  const title = data.title || "Thông báo mới";
  const options = {
    body: data.body || "Bạn có một thông báo mới.",
    icon: data.icon || "/icon.png",
    badge: "/badge.png",
    data: {
      url: data.url || "http://localhost:3000",
    },
  };

  console.log("🔔 Showing notification:", title, options);
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});
