import api from "@/utils/api";

export default async function registerWebPushAPI() {
  console.log("🚀 registerWebPushAPI: Function called");
  
  // Check token first
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;
  if (!token) {
    console.warn("⚠️ registerWebPushAPI: No access token found");
    return false;
  }
  
  if (!("serviceWorker" in navigator)) {
    console.warn("⚠️ registerWebPushAPI: Service Workers not supported");
    return false;
  }
  
  if (!("Notification" in window)) {
    console.warn("⚠️ registerWebPushAPI: Notifications not supported");
    return false;
  }
  
  try {
    // Request permission
    console.log("📝 registerWebPushAPI: Requesting notification permission...");
    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        console.warn("⚠️ registerWebPushAPI: Permission denied");
        return false;
      }
    }
    
    if (Notification.permission !== 'granted') {
      console.warn("⚠️ registerWebPushAPI: Permission not granted");
      return false;
    }
    
    console.log("📝 registerWebPushAPI: Registering service worker...");
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("✅ registerWebPushAPI: Service Worker registered:", registration.scope);
    
    console.log("📝 registerWebPushAPI: Subscribing to push...");
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BGfcgEChdEI-iDX_RwDlob6AVdLxnGIxsd6iERT9PxFm-P8RGwQFDbQnt7-z0mN0wZfVF6m3w5JYuihH_2pG5qQ"
      ),
    });
    
    console.log("✅ registerWebPushAPI: Push Subscription obtained");

    // Send subscription to backend
    console.log("📝 registerWebPushAPI: Sending to backend...");
    await api.post("/notifications/register-device", {
      subscription: subscription.toJSON()
    });
    console.log("✅ registerWebPushAPI: Subscription registered with backend");
    return true;
  } catch (error) {
    console.error("❌ registerWebPushAPI: Error:", error);
    return false;
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
