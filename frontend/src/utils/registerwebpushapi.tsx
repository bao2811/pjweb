export default async function registerWebPushAPI() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered with scope:", registration.scope);
      // Now you can use the Push API
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          "BEluYbX8KJf1Zx1h3QZ6Jt6v9K5j5Z5J5Z5J5Z5J5Z5J5Z5J5Z5J5Z5J5Z5J5Z5J5Z5J5Z5J5Z5J5Z5J5Z5J5Z5J" // Replace with your VAPID public key
        ),
      });
      console.log("Push Subscription:", JSON.stringify(subscription));
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
