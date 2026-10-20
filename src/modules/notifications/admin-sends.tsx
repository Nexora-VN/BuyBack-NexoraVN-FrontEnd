"use client";

import { ListPagination } from "@/components/patterns/list-controls";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { EmptyState, Page } from "@/components/ui/page";
import { formatDateTime } from "@/lib/format";
import { generateUUID } from "@/lib/observability/request-id";
import { usersService } from "@/modules/users/services/users.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Send } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { notificationsService } from "./service";

export function AdminNotificationSendsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<"USER" | "ALL">("USER");
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const sendKey = useRef<{ payload: string; id: string } | null>(null);
  const sends = useQuery({
    queryKey: ["notifications", "sends", page],
    queryFn: () => notificationsService.sends(page),
  });
  const users = useQuery({
    queryKey: ["notifications", "users", term],
    queryFn: () => usersService.list({ page: 1, limit: 20, search: term, status: "ACTIVE" }),
    enabled: target === "USER" && term.length >= 2,
  });
  const send = useMutation({
    mutationFn: notificationsService.send,
    onSuccess: async () => {
      sendKey.current = null;
      setTitle("");
      setBody("");
      setUserId("");
      setPage(1);
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Đã gửi thông báo.");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Không thể gửi thông báo."),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody || (target === "USER" && !userId)) return;
    const payload = {
      target,
      ...(target === "USER" ? { userId } : {}),
      title: trimmedTitle,
      body: trimmedBody,
    };
    const signature = JSON.stringify(payload);
    if (sendKey.current?.payload !== signature)
      sendKey.current = { payload: signature, id: generateUUID() };
    send.mutate({ ...payload, idempotencyKey: sendKey.current.id });
  }

  return (
    <Page
      title="Gửi thông báo"
      description="Gửi tin nhắn một chiều tới người dùng, sau đó xem lịch sử phát."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form
          onSubmit={submit}
          className="bg-card space-y-5 self-start rounded-2xl border p-5 shadow-sm sm:p-6"
        >
          <h2 className="text-lg font-semibold">Thông báo mới</h2>
          <label className="block space-y-2 text-sm font-medium">
            <span>Người nhận</span>
            <Select
              value={target}
              onChange={(event) => {
                setTarget(event.target.value as "USER" | "ALL");
                setUserId("");
              }}
            >
              <option value="USER">Một người dùng</option>
              <option value="ALL">Tất cả người dùng đang hoạt động</option>
            </Select>
          </label>
          {target === "USER" && (
            <div className="space-y-3">
              <label htmlFor="notification-user-search" className="block text-sm font-medium">
                Tìm người dùng theo tên hoặc email
              </label>
              <div className="flex gap-2">
                <Input
                  id="notification-user-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nhập ít nhất 2 ký tự"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTerm(search.trim());
                    setUserId("");
                  }}
                >
                  Tìm
                </Button>
              </div>
              {users.isFetching && (
                <p className="text-muted-foreground text-sm">Đang tìm người dùng...</p>
              )}
              {users.isError && (
                <p className="text-danger text-sm">Không thể tìm người dùng. Vui lòng thử lại.</p>
              )}
              {users.data && (
                <label className="block space-y-2 text-sm font-medium">
                  <span>Chọn người dùng</span>
                  <Select
                    required
                    value={userId}
                    onChange={(event) => setUserId(event.target.value)}
                  >
                    <option value="">Chọn người nhận</option>
                    {users.data.data
                      .filter((user) => user.role === "USER" && user.status === "ACTIVE")
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.displayName || user.fullName || user.email} · {user.email}
                        </option>
                      ))}
                  </Select>
                  {!users.data.data.some(
                    (user) => user.role === "USER" && user.status === "ACTIVE",
                  ) && (
                    <span className="text-muted-foreground text-xs">
                      Không tìm thấy người dùng phù hợp.
                    </span>
                  )}
                </label>
              )}
            </div>
          )}
          <label className="block space-y-2 text-sm font-medium">
            <span>Tiêu đề</span>
            <Input
              required
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ví dụ: Cập nhật tài khoản"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Nội dung</span>
            <Textarea
              required
              maxLength={1000}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Nội dung sẽ hiển thị trong hộp thông báo."
            />
          </label>
          {target === "ALL" && (
            <p className="text-muted-foreground bg-muted rounded-xl p-3 text-sm">
              Thông báo sẽ được gửi tới tất cả tài khoản USER đang hoạt động. Vui lòng kiểm tra nội
              dung trước khi gửi.
            </p>
          )}
          <Button type="submit" disabled={send.isPending || (target === "USER" && !userId)}>
            <Send />
            {send.isPending ? "Đang gửi..." : "Gửi thông báo"}
          </Button>
        </form>
        <section className="space-y-4" aria-label="Lịch sử gửi thông báo">
          <h2 className="text-lg font-semibold">Lịch sử gửi</h2>
          {sends.isLoading ? (
            <div className="bg-card text-muted-foreground flex items-center gap-2 rounded-2xl border p-6">
              <LoaderCircle className="size-5 animate-spin" />
              Đang tải lịch sử...
            </div>
          ) : sends.isError ? (
            <div className="bg-card space-y-3 rounded-2xl border p-6">
              <p>Không thể tải lịch sử gửi.</p>
              <Button variant="outline" onClick={() => void sends.refetch()}>
                Thử lại
              </Button>
            </div>
          ) : !sends.data?.data.length ? (
            <EmptyState
              title="Chưa gửi thông báo nào"
              description="Các thông báo thủ công đã gửi sẽ xuất hiện ở đây."
            />
          ) : (
            <div className="bg-card divide-y overflow-hidden rounded-2xl border shadow-sm">
              {sends.data.data.map((item) => (
                <article key={item.id} className="space-y-2 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="bg-secondary text-primary rounded-full px-2.5 py-1 text-xs font-semibold">
                      {item.target === "ALL" ? "Tất cả USER" : "Một USER"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">{item.body}</p>
                  <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span>{item.recipientCount ?? 0} người nhận</span>
                    <time dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time>
                    <span>Gửi bởi {item.sender.displayName || item.sender.email}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
          {!!sends.data?.meta.total && (
            <ListPagination
              page={page}
              total={sends.data.meta.total}
              totalPages={sends.data.meta.totalPages}
              pending={sends.isFetching}
              onPage={setPage}
            />
          )}
        </section>
      </div>
    </Page>
  );
}
