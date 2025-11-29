self.addEventListener("push", function (event) {
  console.log("Push received:", event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const title = data.title || "Thông báo mới";
  const options = {
    body: data.body || "Bạn có một thông báo mới.",
    icon: data.icon || "/icon.png",
    badge: "/badge.png",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});
