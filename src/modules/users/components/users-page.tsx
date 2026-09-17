"use client";
import { ResourceToolbar } from "@/components/patterns/resource-toolbar";
import { useCopy } from "@/i18n/use-copy";

import { useConfirm } from "@/components/patterns/confirm-provider";
import { ListPagination } from "@/components/patterns/list-controls";
import { SurfaceDialog } from "@/components/patterns/surface-dialog";
import { useListState } from "@/lib/use-list-state";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, initials } from "@/lib/format";
import { useUserMutations, useUsers } from "@/modules/users/hooks/use-users";
import type { User, UserInput } from "@/modules/users/types/user";
import { LoaderCircle, Plus, Trash2, UserRoundPen } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const empty: UserInput & { password: string } = {
  email: "",
  phoneNumber: "+84",
  password: "",
  displayName: "",
  fullName: "",
  role: "USER",
  status: "ACTIVE",
};
export function UsersPage() {
  const t = useCopy();

  const confirm = useConfirm();
  const list = useListState("users");
  const page = list.page,
    query = list.query;
  const saveLock = useRef(false);
  const [saveError, setSaveError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(empty);

  const users = useUsers({
    page,
    limit: 20,
    sort: list.sort,
    ...(["ACTIVE", "DISABLED"].includes(list.status)
      ? { status: list.status as "ACTIVE" | "DISABLED" }
      : {}),
    ...(query ? { search: query } : {}),
  });
  const mutations = useUserMutations();
  const showForm = (user?: User) => {
    setEditing(user ?? null);
    setForm(
      user
        ? {
            email: user.email,
            phoneNumber: user.phoneNumber,
            password: "",
            displayName: user.displayName ?? "",
            fullName: user.fullName ?? "",
            role: user.role,
            status: user.status,
          }
        : empty,
    );
    setSaveError("");
    setOpen(true);
  };
  const save = async () => {
    try {
      if (editing) {
        const { password, ...rest } = form;
        await mutations.update.mutateAsync({
          id: editing.id,
          input: { ...rest, ...(password ? { password } : {}) },
        });
      } else {
        await mutations.create.mutateAsync(form);
      }
      toast.success(editing ? t("Đã cập nhật người dùng") : t("Đã tạo người dùng"));
      setOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : t("Không thể lưu"));
    } finally {
      saveLock.current = false;
    }
  };
  const remove = async (id: string) => {
    if (mutations.remove.isPending) return;
    if (!(await confirm(t("Xóa người dùng này? Hành động cần được xác nhận.")))) return;
    try {
      await mutations.remove.mutateAsync(id);
      toast.success(t("Đã xóa người dùng"));
    } catch (error) {
      toast.error(t.error(error instanceof Error ? error.message : t("Không thể xóa")));
    }
  };
  return (
    <Page
      title={t("Quản lý người dùng")}
      description="Quản lý tài khoản và quyền truy cập trên nền tảng."
      actions={
        <Button onClick={() => showForm()}>
          <Plus />
          {t("Tạo người dùng")}
        </Button>
      }
    >
      <ResourceToolbar
        scope="users"
        label="Tìm theo email hoặc tên hiển thị"
        states={["ACTIVE", "DISABLED"]}
      />
      {users.isLoading ? (
        <div className="skeleton h-56 rounded-2xl" />
      ) : users.isError ? (
        <div className="bg-danger-soft text-danger rounded-2xl border p-5">
          {t("Không thể tải người dùng.")}{" "}
          <button onClick={() => users.refetch()} className="underline">
            {t("Thử lại")}
          </button>
        </div>
      ) : (
        <>
          <DataTable
            rows={users.data?.data ?? []}
            rowKey={(row) => row.id}
            columns={[
              {
                key: "user",
                label: t("Người dùng"),
                render: (row) => (
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="bg-secondary text-primary grid size-9 place-items-center rounded-full font-semibold">
                      {initials(row.displayName ?? row.email)}
                    </span>
                    <div>
                      <p className="font-medium">
                        {row.displayName || row.fullName || t("Chưa đặt tên")}
                      </p>
                      <p className="text-muted-foreground text-xs">{row.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "phone",
                label: t("Điện thoại"),
                render: (row) => row.phoneNumber,
              },
              { key: "role", label: t("Vai trò"), render: (row) => row.role },
              {
                key: "status",
                label: t("Trạng thái"),
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: "date",
                label: t("Ngày tạo"),
                render: (row) => formatDateTime(row.createdAt),
              },
              {
                key: "actions",
                label: "",
                className: "text-right",
                render: (row) => (
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => showForm(row)}
                      aria-label={t("Sửa")}
                    >
                      <UserRoundPen />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(row.id)}
                      aria-label={t("Xóa")}
                      className="text-danger"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
          <ListPagination
            page={page}
            total={users.data?.meta.total ?? 0}
            totalPages={users.data?.meta.totalPages ?? 1}
            pending={users.isFetching}
            onPage={(page) => list.update({ page })}
          />
        </>
      )}
      <SurfaceDialog
        busy={mutations.create.isPending || mutations.update.isPending}
        open={open}
        onOpenChange={setOpen}
        title={editing ? t("Cập nhật người dùng") : t("Tạo người dùng")}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["email", "Email", "email"],
              ["phoneNumber", t("Số điện thoại"), "tel"],
              ["displayName", t("Tên hiển thị"), "text"],
              ["fullName", t("Họ và tên"), "text"],
              [
                "password",
                editing ? t("Mật khẩu mới (không bắt buộc)") : t("Mật khẩu"),
                "password",
              ],
            ].map(([key, label, type]) => (
              <label key={key} className={key === "password" ? "sm:col-span-2" : ""}>
                <span className="mb-1.5 block text-sm font-medium">{t(label)}</span>
                <Input
                  required={!editing || key !== "password"}
                  type={type}
                  value={String(form[key as keyof typeof form] ?? "")}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            <label>
              <span className="mb-1.5 block text-sm font-medium">{t("Vai trò")}</span>
              <Select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as UserInput["role"],
                  })
                }
              >
                <option>USER</option>
                <option>ADMIN</option>
                <option>SUPER_ADMIN</option>
              </Select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">{t("Trạng thái")}</span>
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as UserInput["status"],
                  })
                }
              >
                <option>ACTIVE</option>
                <option>DISABLED</option>
                <option>DELETED</option>
              </Select>
            </label>
          </div>
          {saveError && (
            <p role="alert" className="text-danger mt-4">
              {t.error(saveError)}
            </p>
          )}
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              disabled={mutations.create.isPending || mutations.update.isPending}
              onClick={() => setOpen(false)}
            >
              {t("Hủy")}
            </Button>
            <Button
              type="submit"
              disabled={mutations.create.isPending || mutations.update.isPending}
            >
              {(mutations.create.isPending || mutations.update.isPending) && (
                <LoaderCircle className="animate-spin" />
              )}
              {t("Lưu")}
            </Button>
          </div>
        </form>
      </SurfaceDialog>
    </Page>
  );
}
