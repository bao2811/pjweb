export default async function registerWebPushAPI() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered with scope:", registration.scope);
      // Now you can use the Push API (guarded)
      if (!registration || !registration.pushManager) {
        console.warn("PushManager not available on registration", registration);
        return;
      }

      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            "BGfcgEChdEI-iDX_RwDlob6AVdLxnGIxsd6iERT9PxFm-P8RGwQFDbQnt7-z0mN0wZfVF6m3w5JYuihH_2pG5qQ" // Replace with your VAPID public key
          ),
        });
        console.log("Push Subscription:", JSON.stringify(subscription));
      } catch (err) {
        console.error("Push subscribe failed:", err);
      }
    } catch (error) {
      console.error(
        "Service Worker registration or Push Subscription failed:",
        error
      );
    }
  } else {
    console.warn("Service Workers are not supported in this browser.");
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
