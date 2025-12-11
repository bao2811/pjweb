// Service Worker for Web Push Notifications
// File: public/sw.js

self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push received:", event);

  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error("[Service Worker] Error parsing push data:", e);
      data = {
        title: "Thông báo mới",
        body: event.data.text(),
        url: "/",
      };
    }
  }

  const title = data.title || "Thông báo mới";
  const options = {
    body: data.body || "Bạn có thông báo mới",
    icon: data.icon || "/icons/notification-icon.png",
    badge: data.badge || "/icons/badge-icon.png",
    data: {
      url: data.url || "/",
    },
    tag: data.tag || "notification",
    requireInteraction: false, // Auto close after timeout
    vibrate: [200, 100, 200], // Vibration pattern
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  console.log("[Service Worker] Notification click:", event);

  event.notification.close();

  const url = event.notification.data.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

self.addEventListener("notificationclose", function (event) {
  console.log("[Service Worker] Notification closed:", event);
});

// Handle service worker activation
self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activated");
  event.waitUntil(clients.claim());
});

// Handle service worker installation
self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installed");
  self.skipWaiting();
});
