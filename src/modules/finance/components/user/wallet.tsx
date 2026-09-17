"use client";
import { useCopy } from "@/i18n/use-copy";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { Link } from "@/i18n/navigation";
import { useFinance } from "../../hooks/use-finance";
import type { Dashboard } from "../../types/finance";
import { FinanceTable } from ".././finance-ui";
import { CashbackOverview } from "../user/dashboard";
export function CashbackPage() {
  const t = useCopy();

  return (
    <Page
      title="Cashback"
      description="Hoa hồng chờ trả chỉ là dự kiến. Cashback chỉ khả dụng sau khi xác nhận nhận tiền và hoàn tất kỳ thanh toán."
    >
      <FinanceTable
        path="me/cashbacks"
        searchLabel="Mã checkout Shopee"
        states={["PENDING", "VALIDATED", "AVAILABLE", "REJECTED", "REVERSED"]}
        specs={[
          ["commission.id", t("Mã hoa hồng")],
          ["userAmount", "Cashback", "money"],
          ["state", t("Trạng thái"), "status"],
          ["createdAt", t("Ghi nhận"), "date"],
        ]}
      />
    </Page>
  );
}

export function WalletPage() {
  const t = useCopy();

  const wallet = useFinance<Dashboard>("me/dashboard");
  return (
    <Page
      title={t("Ví của bạn")}
      actions={
        <Button asChild>
          <Link href="/app/withdrawals/new">{t("Yêu cầu rút")}</Link>
        </Button>
      }
    >
      <CashbackOverview />
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/app/cashback">{t("Lịch sử hoàn tiền")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/app/withdrawals">{t("Lịch sử rút tiền")}</Link>
        </Button>
      </div>
      {wallet.data && BigInt(wallet.data.wallet.available) < 0n && (
        <Card role="alert">
          {t(
            "Ví đang có khoản hoàn trả sau điều chỉnh đơn hàng. Bạn có thể rút tiếp khi số dư khả dụng đủ mức tối thiểu.",
          )}
        </Card>
      )}
      <FinanceTable
        path="me/wallet/transactions"
        searchLabel="Mã tham chiếu"
        specs={[
          ["type", t("Loại giao dịch")],
          ["availableDelta", t("Thay đổi khả dụng"), "money"],
          ["reservedDelta", t("Thay đổi đang giữ"), "money"],
          ["availableAfter", t("Khả dụng sau giao dịch"), "money"],
          ["createdAt", t("Thời gian"), "date"],
        ]}
      />
    </Page>
  );
}

export function WithdrawalHistoryPage() {
  const t = useCopy();

  return (
    <Page title={t("Lịch sử rút tiền")}>
      <FinanceTable
        path="me/withdrawals"
        searchLabel="Mã chuyển khoản"
        states={["PENDING", "PROCESSING", "COMPLETED", "REJECTED", "FAILED"]}
        specs={[
          ["id", t("Mã yêu cầu")],
          ["amount", t("Số tiền"), "money"],
          ["bank.bankName", t("Ngân hàng")],
          ["bank.lastFour", t("4 số cuối")],
          ["status", t("Trạng thái"), "status"],
          ["createdAt", t("Ngày tạo"), "date"],
        ]}
      />
    </Page>
  );
}
