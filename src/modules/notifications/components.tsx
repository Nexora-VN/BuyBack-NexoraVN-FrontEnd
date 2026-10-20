"use client";

import { ListPagination } from "@/components/patterns/list-controls";
import { Button } from "@/components/ui/button";
import { EmptyState, Page } from "@/components/ui/page";
import { Link, useRouter } from "@/i18n/navigation";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/modules/auth/components/auth-provider";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, CheckCheck, ChevronRight, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNotificationActions, useNotificationList, useUnreadCount } from "./hooks";
import { notificationHref, type NotificationItem } from "./service";

type Area = "user" | "admin";

function useOpenNotification(area: Area) {
  const router = useRouter();
  const { read } = useNotificationActions();
  return async (item: NotificationItem) => {
    const href = notificationHref(item.href, area);
    if (!item.readAt) {
      try {
        await read.mutateAsync(item.id);
      } catch {
        toast.error("Không thể đánh dấu đã đọc. Vui lòng thử lại.");
      }
    }
    if (href) router.push(href);
  };
}

function NotificationRows({
  items,
  area,
  compact = false,
}: {
  items: NotificationItem[];
  area: Area;
  compact?: boolean;
}) {
  const open = useOpenNotification(area);
  return (
    <div className="divide-border divide-y">
      {items.map((item) => {
        const href = notificationHref(item.href, area);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => void open(item)}
            className={`hover:bg-muted/60 flex w-full items-start gap-3 px-4 py-4 text-left transition-colors ${item.readAt ? "" : "bg-primary/[0.045]"}`}
          >
            <span
              className={`mt-1.5 size-2 shrink-0 rounded-full ${item.readAt ? "bg-border" : "bg-primary"}`}
            />
            <span className="min-w-0 flex-1">
              <span className="text-foreground block text-sm font-semibold">{item.title}</span>
              <span
                className={`text-muted-foreground mt-1 block text-sm leading-5 ${compact ? "line-clamp-2" : ""}`}
              >
                {item.body}
              </span>
              <time className="text-muted-foreground mt-2 block text-xs" dateTime={item.createdAt}>
                {formatDateTime(item.createdAt)}
              </time>
            </span>
            {href && (
              <ChevronRight
                aria-hidden="true"
                className="text-muted-foreground mt-1 size-4 shrink-0"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function NotificationBell({ area }: { area: Area }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const enabled = Boolean(user);
  const count = useUnreadCount(enabled);
  const list = useNotificationList(1, false, 5, enabled);
  const { readAll } = useNotificationActions();
  const base = area === "admin" ? "/admin/notifications" : "/app/notifications";

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Thông báo${count.data?.count ? `, ${count.data.count} chưa đọc` : ""}`}
          className="hover:bg-muted relative grid size-11 shrink-0 place-items-center rounded-xl"
        >
          <Bell className="size-5" aria-hidden="true" />
          {!!count.data?.count && (
            <span className="bg-primary text-primary-foreground absolute top-0 right-0 grid min-w-5 rounded-full px-1 text-[10px] leading-5 font-bold">
              {count.data.count > 99 ? "99+" : count.data.count}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="bg-card z-50 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border shadow-xl"
        >
          <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <strong>Thông báo</strong>
            {!!count.data?.count && (
              <button
                type="button"
                disabled={readAll.isPending}
                className="text-primary text-xs font-semibold disabled:opacity-50"
                onClick={async () => {
                  try {
                    await readAll.mutateAsync();
                  } catch {
                    toast.error("Không thể đánh dấu đã đọc.");
                  }
                }}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div className="max-h-[min(60vh,26rem)] overflow-y-auto">
            {list.isLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 p-6 text-sm">
                <LoaderCircle className="size-4 animate-spin" />
                Đang tải thông báo...
              </div>
            ) : list.isError ? (
              <div className="space-y-2 p-5 text-sm">
                <p>Không thể tải thông báo.</p>
                <Button variant="outline" onClick={() => void list.refetch()}>
                  Thử lại
                </Button>
              </div>
            ) : list.data?.data.length ? (
              <NotificationRows items={list.data.data} area={area} compact />
            ) : (
              <p className="text-muted-foreground p-6 text-center text-sm">
                Chưa có thông báo nào.
              </p>
            )}
          </div>
          <DropdownMenu.Item asChild>
            <Link
              href={base}
              className="text-primary hover:bg-muted block border-t px-4 py-3 text-center text-sm font-semibold outline-none"
            >
              Xem tất cả thông báo
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function NotificationsPage({ area }: { area: Area }) {
  const [page, setPage] = useState(1);
  const [unread, setUnread] = useState(false);
  const list = useNotificationList(page, unread);
  const { readAll } = useNotificationActions();
  return (
    <Page
      title="Thông báo"
      description="Theo dõi các cập nhật quan trọng và công việc cần xử lý."
      actions={
        <Button
          variant="outline"
          disabled={readAll.isPending || !list.data?.data.some((item) => !item.readAt)}
          onClick={async () => {
            try {
              await readAll.mutateAsync();
            } catch {
              toast.error("Không thể đánh dấu đã đọc.");
            }
          }}
        >
          <CheckCheck /> Đánh dấu tất cả đã đọc
        </Button>
      }
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {([false, true] as const).map((onlyUnread) => (
          <button
            key={String(onlyUnread)}
            type="button"
            aria-pressed={unread === onlyUnread}
            onClick={() => {
              setUnread(onlyUnread);
              setPage(1);
            }}
            className={`min-h-11 rounded-xl px-4 text-sm font-semibold ${unread === onlyUnread ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border"}`}
          >
            {onlyUnread ? "Chưa đọc" : "Tất cả"}
          </button>
        ))}
      </div>
      {list.isLoading ? (
        <div className="bg-card text-muted-foreground flex items-center gap-2 rounded-2xl border p-6">
          <LoaderCircle className="size-5 animate-spin" />
          Đang tải thông báo...
        </div>
      ) : list.isError ? (
        <div className="bg-card space-y-3 rounded-2xl border p-6">
          <p>Không thể tải thông báo. Vui lòng thử lại.</p>
          <Button variant="outline" onClick={() => void list.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : !list.data?.data.length ? (
        <EmptyState
          title={unread ? "Bạn đã đọc hết thông báo" : "Chưa có thông báo"}
          description={
            unread
              ? "Những thông báo mới sẽ xuất hiện ở đây."
              : "Các cập nhật quan trọng sẽ xuất hiện ở đây."
          }
        />
      ) : (
        <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
          <NotificationRows items={list.data.data} area={area} />
        </div>
      )}
      {!!list.data?.meta.total && (
        <div className="mt-5">
          <ListPagination
            page={page}
            total={list.data.meta.total}
            totalPages={list.data.meta.totalPages}
            pending={list.isFetching}
            onPage={setPage}
          />
        </div>
      )}
    </Page>
  );
}

export { NotificationPermissionPrompt } from "./components/notification-permission-prompt";
