"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { listenForegroundPush } from "@/lib/firebase/messaging";
import { notificationsService } from "./service";
import type { NotificationItem, Paginated } from "./service";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (page: number, unread: boolean, limit = 20) =>
    ["notifications", "list", page, unread, limit] as const,
  unread: ["notifications", "unread-count"] as const,
};

export function useNotificationList(page: number, unread = false, limit = 20, enabled = true) {
  return useQuery({
    queryKey: notificationKeys.list(page, unread, limit),
    queryFn: () => notificationsService.list(page, unread, limit),
    enabled,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unread,
    queryFn: notificationsService.unreadCount,
    enabled,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useNotificationActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  const read = useMutation({
    mutationFn: notificationsService.read,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const lists = queryClient.getQueriesData<Paginated<NotificationItem>>({
        queryKey: ["notifications", "list"],
      });
      const count = queryClient.getQueryData<{ count: number }>(notificationKeys.unread);
      const wasUnread = lists.some(([, data]) =>
        data?.data.some((item) => item.id === id && !item.readAt),
      );
      for (const [key, data] of lists) {
        if (!data) continue;
        const unreadFilter = key[3] === true;
        const items = data.data.map((item) =>
          item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
        );
        queryClient.setQueryData(key, {
          ...data,
          data: unreadFilter ? items.filter((item) => !item.readAt) : items,
          meta:
            unreadFilter && data.data.length !== items.filter((item) => !item.readAt).length
              ? { ...data.meta, total: Math.max(0, data.meta.total - 1) }
              : data.meta,
        });
      }
      if (count && wasUnread)
        queryClient.setQueryData(notificationKeys.unread, { count: Math.max(0, count.count - 1) });
      return { lists, count };
    },
    onError: (_error, _id, context) => {
      context?.lists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.count) queryClient.setQueryData(notificationKeys.unread, context.count);
    },
    onSettled: invalidate,
  });
  const readAll = useMutation({
    mutationFn: notificationsService.readAll,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const lists = queryClient.getQueriesData<Paginated<NotificationItem>>({
        queryKey: ["notifications", "list"],
      });
      const count = queryClient.getQueryData<{ count: number }>(notificationKeys.unread);
      for (const [key, data] of lists) {
        if (!data) continue;
        queryClient.setQueryData(key, {
          ...data,
          data:
            key[3] === true
              ? []
              : data.data.map((item) => ({
                  ...item,
                  readAt: item.readAt ?? new Date().toISOString(),
                })),
          meta: key[3] === true ? { ...data.meta, total: 0, totalPages: 0 } : data.meta,
        });
      }
      queryClient.setQueryData(notificationKeys.unread, { count: 0 });
      return { lists, count };
    },
    onError: (_error, _variables, context) => {
      context?.lists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.count) queryClient.setQueryData(notificationKeys.unread, context.count);
    },
    onSettled: invalidate,
  });
  return { read, readAll };
}

export function useFcmForegroundListener() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = listenForegroundPush((payload) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });

      const title =
        payload.notification?.title ||
        payload.data?.title ||
        "Thông báo mới";
      const body = payload.notification?.body || payload.data?.body || "";
      const href = payload.data?.href || "/app/notifications";

      toast.info(title, {
        description: body,
        action: {
          label: "Xem",
          onClick: () => {
            router.push(href);
          },
        },
      });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, router]);
}
