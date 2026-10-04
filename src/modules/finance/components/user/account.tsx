"use client";
import { useRef, useState } from "react";
import { useConfirm } from "@/components/patterns/confirm-provider";
import { useCopy } from "@/i18n/use-copy";
import { useTranslations } from "next-intl";
import { BrandAvatar } from "@/components/patterns/brand-avatar";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/modules/auth/components/auth-provider";
import { toast } from "sonner";
import { ChevronRight, Landmark, Link2, LogOut } from "lucide-react";
import { useRefreshFinance } from "../../hooks/use-finance";
import { bankSchema } from "../../schemas/finance";
import { financeService } from "../../services/finance";
import type { FinanceRow } from "../../types/finance";
import { ActionDialog, FinanceTable, MutationForm, text } from ".././finance-ui";

export const bankFields = [
  { name: "bankCode", label: "Mã ngân hàng" },
  { name: "bankName", label: "Tên ngân hàng" },
  { name: "accountHolder", label: "Tên chủ tài khoản" },
  { name: "accountNumber", label: "Số tài khoản" },
];

export function AccountPage() {
  const t = useCopy();
  const endUser = useTranslations("EndUser");

  const router = useRouter();
  const { user, logout } = useAuth();
  const refresh = useRefreshFinance();
  const confirm = useConfirm();
  const [removing, setRemoving] = useState<string | null>(null);
  const removeLock = useRef(false);
  async function remove(id: string) {
    if (removeLock.current) return;
    if (
      !(await confirm(
        t("Gỡ tài khoản khỏi danh sách sử dụng? Yêu cầu rút đã tạo vẫn giữ nguyên thông tin."),
      ))
    )
      return;
    removeLock.current = true;
    setRemoving(id);
    try {
      await financeService.remove("me/bank-accounts/" + id);
      await refresh();
      toast.success(t("Đã gỡ"));
    } catch (error) {
      toast.error(t.error(error instanceof Error ? error.message : "Không thể xóa"));
    } finally {
      setRemoving(null);
      removeLock.current = false;
    }
  }
  const bankActions = (row: FinanceRow) => (
    <div className="flex flex-wrap gap-2">
      <ActionDialog label="Sửa">
        <MutationForm
          title={t("Tạo phiên bản tài khoản mới")}
          successMessage="Đã cập nhật tài khoản ngân hàng"
          path={"me/bank-accounts/" + row.id}
          method="patch"
          fields={bankFields}
          schema={bankSchema}
          initialValues={{
            bankCode: text(row, "bankCode"),
            bankName: text(row, "bankName"),
            accountHolder: text(row, "accountHolder"),
          }}
        />
      </ActionDialog>
      <Button variant="outline" disabled={removing !== null} onClick={() => void remove(row.id)}>
        {t("Gỡ")}
      </Button>
    </div>
  );
  return (
    <Page title={t("Tài khoản của bạn")} description={endUser("accountDescription")}>
      <Card className="flex items-center gap-4">
        <div className="user-icon-box">
          <BrandAvatar className="size-full" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold break-all">{user?.email}</h2>
        </div>
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-muted-foreground lg:text-foreground text-xs font-bold tracking-wide uppercase lg:text-lg lg:normal-case">
            {t("Tài khoản ngân hàng")}
          </h2>
          <p className="text-muted-foreground mt-1 hidden max-w-2xl text-sm leading-6 lg:block">
            {t(
              "Thông tin ngân hàng được bảo vệ. Tài khoản mới hoặc chỉnh sửa cần được duyệt trước khi rút tiền.",
            )}
          </p>
        </div>
        <ActionDialog label="Thêm mới">
          <MutationForm
            title={t("Thêm tài khoản ngân hàng")}
            successMessage="Đã thêm tài khoản ngân hàng"
            path="me/bank-accounts"
            fields={bankFields}
            schema={bankSchema}
          />
        </ActionDialog>
      </div>
      <FinanceTable
        path="me/bank-accounts"
        searchLabel="Tên chủ tài khoản"
        hideMobileControls
        mobileLoadingRows={1}
        emptyMobileDescription={endUser("bankAccountsEmpty")}
        states={["PENDING", "APPROVED", "REJECTED"]}
        specs={[
          ["bankName", t("Ngân hàng")],
          ["accountHolder", t("Chủ tài khoản")],
          ["lastFour", t("4 số cuối")],
          ["status", t("Trạng thái"), "status"],
          ["reviewReason", t("Kết quả duyệt")],
        ]}
        actions={bankActions}
        mobileRender={(row) => (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="user-icon-box !size-11">
                <Landmark className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold break-words">{text(row, "bankName")}</p>
                  <StatusBadge domain="bank" status={text(row, "status")} />
                </div>
                <p className="text-muted-foreground mt-1 text-xs break-words">
                  {text(row, "accountHolder")} • •••• {text(row, "lastFour")}
                </p>
                {text(row, "reviewReason") !== "—" && (
                  <p className="text-danger mt-1 text-xs">{text(row, "reviewReason")}</p>
                )}
              </div>
            </div>
            <div className="border-t pt-3">{bankActions(row)}</div>
          </div>
        )}
      />
      <div className="hidden flex-wrap gap-3 lg:flex">
        <Button asChild variant="outline">
          <Link href="/app/links">{t("Link của tôi")}</Link>
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            if (await logout()) router.replace("/login");
          }}
        >
          {t("Đăng xuất")}
        </Button>
      </div>
      <div className="space-y-4 lg:hidden">
        <Link
          href="/app/links"
          className="bg-card flex min-h-16 items-center gap-3 rounded-2xl border p-4 font-semibold"
        >
          <Link2 className="text-primary size-5" aria-hidden="true" />
          <span className="flex-1">{t("Link của tôi")}</span>
          <ChevronRight className="text-muted-foreground size-4" aria-hidden="true" />
        </Link>
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            if (await logout()) router.replace("/login");
          }}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t("Đăng xuất")}
        </Button>
      </div>
    </Page>
  );
}
