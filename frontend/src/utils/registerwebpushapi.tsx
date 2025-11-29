import api from "./api";

export default async function registerWebPushAPI() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Workers are not supported in this browser.");
    return;
  }

  if (!("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser.");
    return;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return;
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker registered with scope:", registration.scope);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        "BGfcgEChdEI-iDX_RwDlob6AVdLxnGIxsd6iERT9PxFm-P8RGwQFDbQnt7-z0mN0wZfVF6m3w5JYuihH_2pG5qQ" // Replace with your VAPID public key
      ),
    });

    console.log("Push Subscription:", JSON.stringify(subscription));

    // Send subscription to backend
    const subscriptionJSON = subscription.toJSON();
    await api.post("/push/subscribe", {
      endpoint: subscriptionJSON.endpoint,
      keys: {
        p256dh: subscriptionJSON.keys?.p256dh,
        auth: subscriptionJSON.keys?.auth,
      },
    });

    console.log("Push subscription saved to backend successfully");
  } catch (error) {
    console.error(
      "Service Worker registration or Push Subscription failed:",
      error
    );
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
