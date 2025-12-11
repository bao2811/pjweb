self.addEventListener("push", function (event) {
  console.log("Push received:", event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const title = data.title || "Thông báo mới";
  const options = {
    body: data.body || "Bạn có một thông báo mới.",
    icon: data.icon || "/icons/notification-icon.png",
    badge: data.badge || "/icons/badge-icon.png",
    tag: data.tag || "event-notification",
    timestamp: data.timestamp ? Date.parse(data.timestamp) : Date.now(),
    requireInteraction: data.requireInteraction ?? false,
    renotify: data.renotify ?? true,
    data: {
      url: data.url || "/notifications",
      // Bạn có thể thêm metadata khác ở đây nếu muốn
      extra: data.extraData || null,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Nếu tab đã mở với URL → focus
        for (let client of windowClients) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // Nếu chưa mở → mở tab mới
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
