// Hook for Web Push Notifications
// File: src/hooks/usePushNotifications.ts

import { useState, useEffect } from "react";

interface PushNotificationConfig {
  apiBaseUrl: string;
  vapidPublicKey: string;
}

export const usePushNotifications = (config: PushNotificationConfig) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if browser supports push notifications
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    } else {
      setError("Push notifications are not supported in this browser");
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        setSubscription(existingSubscription);
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error("Error checking subscription:", err);
    }
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Push notifications are not supported");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setError("Notification permission denied");
        setLoading(false);
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const convertedVapidKey = urlBase64ToUint8Array(config.vapidPublicKey);

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource,
      });

      setSubscription(pushSubscription);

      // Get device name
      const deviceName = navigator.userAgent.includes("Chrome")
        ? "Chrome"
        : navigator.userAgent.includes("Firefox")
        ? "Firefox"
        : navigator.userAgent.includes("Safari")
        ? "Safari"
        : "Unknown Browser";

      // Send subscription to backend
      const token = localStorage.getItem("token"); // Adjust based on your auth setup

      const response = await fetch(`${config.apiBaseUrl}/user/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: pushSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(pushSubscription.getKey("p256dh")),
            auth: arrayBufferToBase64(pushSubscription.getKey("auth")),
          },
          device_name: deviceName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription on server");
      }

      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("Error subscribing to push notifications:", err);
      setError(err.message || "Failed to subscribe to push notifications");
      setLoading(false);
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      // Unsubscribe from backend
      const response = await fetch(
        `${config.apiBaseUrl}/user/push/unsubscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove subscription from server");
      }

      // Unsubscribe from browser
      await subscription.unsubscribe();

      setSubscription(null);
      setIsSubscribed(false);
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("Error unsubscribing from push notifications:", err);
      setError(err.message || "Failed to unsubscribe from push notifications");
      setLoading(false);
      return false;
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer | null): string => {
    if (!buffer) return "";
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    error,
    loading,
    subscribe,
    unsubscribe,
  };
};
