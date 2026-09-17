"use client";
import { SettlementEligibility } from "../settlement-eligibility";
import { useCopy } from "@/i18n/use-copy";

import { Card } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatDateTime, formatVnd } from "@/lib/format";
import { useFinance } from "../../hooks/use-finance";
import type { FinanceRow } from "../../types/finance";
import { Failure, FinanceTable, Loading, read, text } from ".././finance-ui";

export const orderSpecs: [string, string, ("money" | "status" | "date")?][] = [
  ["productSummary.name", "Sản phẩm"],
  ["orderSn", "Mã đơn"],
  ["checkout.purchasedAt", "Ngày mua", "date"],
  ["status", "Trạng thái đơn", "status"],
  ["checkout.commission.state", "Hoa hồng", "status"],
  ["checkout.commission.cashback.userAmount", "Cashback", "money"],
];

export function UserOrdersPage() {
  const t = useCopy();

  return (
    <Page
      title={t("Đơn hàng của bạn")}
      description="Các đơn hàng của bạn mua qua Piggy sẽ được hiển thị dưới đây nè."
    >
      <FinanceTable
        path="me/orders"
        searchLabel="Mã đơn Shopee, TikTok"
        states={["VALIDATED", "REJECTED", "PARTIALLY_VALIDATED", "MANUAL_REVIEW"]}
        specs={orderSpecs}
        actions={(row) => (
          <Link
            className="text-primary inline-flex min-h-11 items-center underline"
            href={"/app/orders/" + row.id}
          >
            {t("Chi tiết")}
          </Link>
        )}
      />
    </Page>
  );
}

export function UserOrderDetailPage({ id, admin = false }: { id: string; admin?: boolean }) {
  const t = useCopy();

  const query = useFinance<FinanceRow>((admin ? "admin/" : "me/") + "orders/" + id);
  return (
    <Page title={t("Chi tiết đơn hàng")}>
      {query.isLoading ? (
        <Loading />
      ) : query.isError ? (
        <Failure message={query.error.message} retry={() => void query.refetch()} />
      ) : (
        query.data && (
          <>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{text(query.data, "orderSn")}</h2>
                {admin && (
                  <span className="text-muted-foreground font-mono text-sm">
                    {text(query.data, "provider")}
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">{t("Trạng thái đơn")}</p>
                  <StatusBadge domain="order" status={text(query.data, "status")} />
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">{t("Hoa hồng")}</p>
                  <StatusBadge
                    domain="commission"
                    status={text(query.data, "checkout.commission.state")}
                  />
                </div>
              </div>
              <p className="mt-4">
                {t("Cashback dự kiến:")}
                <strong>
                  {formatVnd(text(query.data, "checkout.commission.cashback.userAmount"))}
                </strong>
              </p>
              {admin && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {t("Hoa hồng đối soát (VND):")}
                  <strong>
                    {formatVnd(
                      text(query.data, "checkout.commission.estimatedVnd") === "—"
                        ? "0"
                        : text(query.data, "checkout.commission.estimatedVnd"),
                    )}
                  </strong>
                </p>
              )}
              {Boolean(read(query.data, "checkout.purchasedAt")) && (
                <p className="text-muted-foreground mt-2 text-sm">
                  {t("Ngày mua:")}
                  {formatDateTime(text(query.data, "checkout.purchasedAt"))}
                </p>
              )}
              {admin && text(query.data, "checkout.utmContent") !== "—" && (
                <div className="bg-muted/60 mt-3 rounded-lg p-3 text-xs">
                  <p className="text-muted-foreground font-semibold">{t("Attribution UTM:")}</p>
                  <p className="mt-1 font-mono break-all">
                    {text(query.data, "checkout.utmContent")}
                  </p>
                </div>
              )}
            </Card>

            {admin && Boolean(query.data.settlementEligibility) && (
              <Card>
                <h2 className="mb-3 font-semibold">{t("Điều kiện quyết toán")}</h2>
                <SettlementEligibility value={query.data.settlementEligibility} />
              </Card>
            )}

            <Card>
              <h2 className="font-semibold">{t("Sản phẩm trong đơn")}</h2>
              <div className="mt-4 space-y-3">
                {((read(query.data, "items") as FinanceRow[]) ?? []).map((item) => {
                  const itemScale = text(item, "scale") === "100000" ? 100000n : 1n;
                  const rawAmount = text(item, "actualAmountRaw");
                  const actualAmountVnd = rawAmount === "—" ? 0n : BigInt(rawAmount) / itemScale;
                  return (
                    <div key={item.id} className="space-y-2 rounded-xl border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">
                          {text(item, "itemName") === "—"
                            ? text(item, "payload.item_name")
                            : text(item, "itemName")}
                        </p>
                        <div className="flex gap-2">
                          <StatusBadge status={text(item, "status")} />
                          {text(item, "commissionStatus") !== "—" && (
                            <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
                              {text(item, "commissionStatus")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-2 text-sm sm:grid-cols-3">
                        <p>
                          {t("Giá trị mua:")}
                          <strong>{formatVnd(actualAmountVnd)}</strong>
                        </p>
                        {admin && text(item, "commissionVnd") !== "—" && (
                          <p>
                            {t("Hoa hồng:")}
                            <strong>{formatVnd(text(item, "commissionVnd"))}</strong>
                          </p>
                        )}
                        {admin &&
                          text(item, "mcnFeeVnd") !== "—" &&
                          BigInt(
                            text(item, "mcnFeeVnd") === "—" ? "0" : text(item, "mcnFeeVnd"),
                          ) !== 0n && (
                            <p className="text-warning">
                              {t("Phí MCN:")}
                              <strong>{formatVnd(text(item, "mcnFeeVnd"))}</strong>
                            </p>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )
      )}
    </Page>
  );
}
