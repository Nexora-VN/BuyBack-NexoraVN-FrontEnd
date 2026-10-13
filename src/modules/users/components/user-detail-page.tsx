"use client";
import { useCopy } from "@/i18n/use-copy";

import { Card } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, initials } from "@/lib/format";
import { useUser } from "@/modules/users/hooks/use-users";
import { userRoleLabel } from "@/modules/users/types/user";
import { Mail, Phone, Shield, UserRound } from "lucide-react";

export function UserDetailPage({ id }: { id: string }) {
  const t = useCopy();
  const query = useUser(id);
  if (query.isLoading)
    return (
      <Page title={t("Chi tiết người dùng")}>
        <div className="skeleton h-64 rounded-2xl" />
      </Page>
    );
  if (!query.data)
    return (
      <Page title={t("Không tìm thấy người dùng")}>
        <p className="text-danger">{t("Không thể tải dữ liệu tài khoản.")}</p>
      </Page>
    );
  const user = query.data;
  return (
    <Page title={t("Chi tiết người dùng")} description="Thông tin tài khoản và quyền truy cập.">
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="text-center">
          <span className="bg-secondary text-primary mx-auto grid size-24 place-items-center rounded-full text-3xl font-bold">
            {initials(user.displayName ?? user.email)}
          </span>
          <h2 className="mt-4 text-xl font-bold break-words">
            {user.displayName || user.fullName || t("Chưa đặt tên")}
          </h2>
          <details className="text-muted-foreground mt-2 text-xs">
            <summary className="cursor-pointer">Mã tài khoản</summary>
            <p className="break-all">{user.id}</p>
          </details>
          <div className="mt-4">
            <StatusBadge status={user.status} />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">{t("Thông tin tài khoản")}</h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            {[
              [Mail, "Email", user.email],
              [Phone, t("Số điện thoại"), user.phoneNumber ?? "—"],
              [UserRound, t("Họ và tên"), user.fullName || t("Chưa cập nhật")],
              [Shield, t("Vai trò"), userRoleLabel(user.role)],
            ].map(([Icon, label, value]) => {
              const C = Icon as typeof Mail;
              return (
                <div key={t(String(label))} className="bg-muted rounded-xl p-4">
                  <dt className="text-muted-foreground flex items-center gap-2 text-xs font-semibold uppercase">
                    <C className="size-4" />
                    {t(String(label))}
                  </dt>
                  <dd className="mt-2 font-medium break-all">{String(value)}</dd>
                </div>
              );
            })}
          </dl>
          <p className="text-muted-foreground mt-5 text-sm">
            {t("Tạo lúc")}
            {formatDateTime(user.createdAt)} {t("· Cập nhật")}
            {formatDateTime(user.updatedAt)}
          </p>
        </Card>
      </div>
    </Page>
  );
}
