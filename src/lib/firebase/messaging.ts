import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
  type MessagePayload,
} from "firebase/messaging";
import { firebaseConfig, FIREBASE_VAPID_KEY } from "./config";
import { notificationsService } from "@/modules/notifications/service";

const FCM_TOKEN_STORAGE_KEY = "piggy_fcm_token";

export function getFirebaseApp(): FirebaseApp {
  const apps = getApps();
  return apps.length > 0 ? apps[0]! : initializeApp(firebaseConfig);
}

export async function isPushNotificationSupported(): Promise<boolean> {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator)
  ) {
    return false;
  }
  try {
    return await isSupported();
  } catch {
    return false;
  }
}

export async function getPushMessaging(): Promise<Messaging | null> {
  const supported = await isPushNotificationSupported();
  if (!supported) return null;
  const app = getFirebaseApp();
  return getMessaging(app);
}

export async function requestNotificationPermissionAndRegisterToken(): Promise<string | null> {
  try {
    const supported = await isPushNotificationSupported();
    if (!supported) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const messaging = await getPushMessaging();
    if (!messaging) return null;

    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: FIREBASE_VAPID_KEY || undefined,
    });

    if (token) {
      await notificationsService.registerDeviceToken({
        token,
        deviceType: "web",
      });
      try {
        localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
      } catch {
        // Storage might be unavailable in private modes
      }
      return token;
    }
    return null;
  } catch (error) {
    console.warn("[FCM] Failed to register device token", error);
    return null;
  }
}

export async function unregisterPushNotificationToken(): Promise<void> {
  try {
    let token: string | null = null;
    try {
      token = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    } catch {
      // Ignore
    }

    if (token) {
      await notificationsService.unregisterDeviceToken({ token }).catch(() => {});
      const messaging = await getPushMessaging();
      if (messaging) {
        await deleteToken(messaging).catch(() => {});
      }
      try {
        localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  } catch (error) {
    console.warn("[FCM] Failed to unregister device token", error);
  }
}

export function listenForegroundPush(
  callback: (payload: MessagePayload) => void,
): () => void {
  let unsubscribe: (() => void) | null = null;
  let active = true;

  getPushMessaging().then((messaging) => {
    if (!active || !messaging) return;
    try {
      unsubscribe = onMessage(messaging, (payload) => {
        callback(payload);
      });
    } catch (err) {
      console.warn("[FCM] Foreground listener error", err);
    }
  });

  return () => {
    active = false;
    unsubscribe?.();
  };
}
