"use client";
import { ResourceToolbar } from "@/components/patterns/resource-toolbar";

import { ListPagination } from "@/components/patterns/list-controls";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime,initials } from "@/lib/format";
import { Plus,Trash2,UserRoundPen } from "lucide-react";

import dynamic from 'next/dynamic';
import { useUsersPage } from '../hooks/use-users-page';
const UserFormDialog = dynamic(() => import('./user-form-dialog').then((module) => module.UserFormDialog));
export function UsersPage() { const state = useUsersPage(); const { t, list, page, users, showForm, remove, open, form } = state;
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
      {state.open && <UserFormDialog state={state} />}
    </Page>
  );
}
