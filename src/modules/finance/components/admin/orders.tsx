"use client";
import { useCopy } from "@/i18n/use-copy";

import { Button } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { Link } from "@/i18n/navigation";
import { FinanceTable } from ".././finance-ui";
import { SettlementEligibility } from ".././settlement-eligibility";
import { orderSpecs, UserOrderDetailPage } from ".././user-pages";

export function AdminOrdersPage() {
  const t = useCopy();
  return (
    <Page title={t("Đơn hàng")}>
      <FinanceTable
        path="admin/orders"
        searchLabel="Mã đơn Shopee, TikTok"
        states={["VALIDATED", "REJECTED", "PARTIALLY_VALIDATED", "MANUAL_REVIEW"]}
        specs={orderSpecs}
        actions={(row) => (
          <Link className="text-primary underline" href={"/admin/orders/" + row.id}>
            {t("Chi tiết")}
          </Link>
        )}
      />
    </Page>
  );
}

export function AdminOrderDetailPage({ id }: { id: string }) {
  return <UserOrderDetailPage id={id} admin />;
}

export function CommissionAdminPage() {
  const t = useCopy();

  return (
    <Page
      title={t("Hoa hồng")}
      description="Chỉ hoa hồng đã xác minh thanh toán và gắn đúng người dùng mới đủ điều kiện quyết toán. Đơn hoàn thành nhưng chờ trả hoa hồng vẫn là dự kiến."
      actions={
        <Button asChild>
          <Link href="/admin/settlements">{t("Kỳ thanh toán")}</Link>
        </Button>
      }
    >
      <FinanceTable
        path="admin/commissions"
        searchLabel="Mã checkout"
        states={["ESTIMATED", "VALIDATED", "PAID", "REJECTED", "REVERSED", "MANUAL_REVIEW"]}
        specs={[
          ["id", t("Mã commission")],
          ["userId", t("Người dùng")],
          ["checkout.checkoutId", "Checkout"],
          ["checkout.provider", t("Nguồn")],
          ["estimatedVnd", t("Hoa hồng VND"), "money"],
          ["settledVnd", t("Thực nhận"), "money"],
          ["cashback.userAmount", "Cashback", "money"],
          ["state", t("Trạng thái"), "status"],
        ]}
        extraColumns={[
          {
            key: "eligibility",
            label: t("Điều kiện quyết toán"),
            render: (row) => <SettlementEligibility value={row.settlementEligibility} />,
          },
        ]}
      />
    </Page>
  );
}

export function LedgerAdminPage() {
  const t = useCopy();
  return (
    <Page
      title={t("Ví & Ledger")}
      description="Nhật ký thay đổi số dư. Giao dịch đã ghi chỉ được bù trừ bằng giao dịch mới."
    >
      <FinanceTable
        path="admin/wallet/transactions"
        searchLabel="Mã tham chiếu"
        specs={[
          ["walletId", t("Ví")],
          ["type", t("Loại")],
          ["availableDelta", t("Khả dụng +/-"), "money"],
          ["reservedDelta", t("Đang giữ +/-"), "money"],
          ["availableAfter", t("Khả dụng sau"), "money"],
          ["reference", t("Tham chiếu")],
          ["createdAt", t("Thời gian"), "date"],
        ]}
      />
    </Page>
  );
}
