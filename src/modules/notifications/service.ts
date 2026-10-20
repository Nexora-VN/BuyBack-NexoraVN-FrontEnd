import { apiClient } from "@/lib/api/client";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  createdAt: string;
  readAt: string | null;
};

export type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type NotificationSend = {
  id: string;
  target: "USER" | "ALL";
  userId?: string | null;
  title: string;
  body: string;
  recipientCount: number;
  createdAt: string;
  senderId: string;
  sender: { email: string; displayName: string | null };
};

export const notificationsService = {
  list: (page: number, unread = false, limit = 20) =>
    apiClient.get<Paginated<NotificationItem>>("/api/backend/me/notifications", {
      params: { page, limit, unread: unread || undefined },
    }),
  unreadCount: () => apiClient.get<{ count: number }>("/api/backend/me/notifications/unread-count"),
  read: (id: string) =>
    apiClient.patch<NotificationItem>(
      `/api/backend/me/notifications/${encodeURIComponent(id)}/read`,
    ),
  readAll: () => apiClient.patch<{ count: number }>("/api/backend/me/notifications/read-all"),
  sends: (page: number) =>
    apiClient.get<Paginated<NotificationSend>>("/api/backend/admin/notifications/sends", {
      params: { page, limit: 20 },
    }),
  send: (input: {
    target: "USER" | "ALL";
    userId?: string;
    title: string;
    body: string;
    idempotencyKey: string;
  }) => apiClient.post<NotificationSend>("/api/backend/admin/notifications/sends", input),
  registerDeviceToken: (input: { token: string; deviceType?: "web" | "android" | "ios" }) =>
    apiClient.post<{ success: boolean }>("/api/backend/me/device-tokens", input),
  unregisterDeviceToken: (input: { token: string }) =>
    apiClient.delete<{ success: boolean }>("/api/backend/me/device-tokens", input),
};

// The API returns internal destinations only. Keep navigation safe if data is malformed.
export function notificationHref(href: string | null, role: "user" | "admin"): string | null {
  if (!href || !href.startsWith("/") || href.startsWith("//") || href.includes("\\")) return null;
  if (!/^\/(app|admin)(\/|$)/.test(href)) return null;
  if (role === "user" && !href.startsWith("/app/") && href !== "/app") return null;
  if (role === "admin" && !href.startsWith("/admin/") && href !== "/admin") return null;
  return href;
}
