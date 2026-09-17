"use client";
import { useCopy } from "@/i18n/use-copy";

import { Card, StatCard } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatVnd } from "@/lib/format";
import { GenerateLinkPanel } from "@/modules/affiliate/components/generate-link-page";
import { useFinance } from "../../hooks/use-finance";
import type { Dashboard, OrderRow, FinanceList } from "../../types/finance";
import { Failure, Loading, text } from ".././finance-ui";

export function DashboardContent({ admin = false }: { admin?: boolean }) {
  const t = useCopy();

  const query = useFinance<Dashboard>(admin ? "admin/dashboard" : "me/dashboard");
  if (query.isLoading) return <Loading />;
  if (query.isError)
    return <Failure message={query.error.message} retry={() => void query.refetch()} />;
  if (!query.data) return null;
  const data = query.data;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Đơn đã ghi nhận" value={data.orders} />
        <StatCard label="Khả dụng" value={formatVnd(data.wallet.available)} />
        <StatCard label="Đang giữ cho yêu cầu rút" value={formatVnd(data.wallet.reserved)} />
      </div>
      <Card>
        <h2 className="font-semibold">{t("Trạng thái hoa hồng")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.commissions.map((c) => (
            <div className="rounded-xl border p-4" key={c.state}>
              <StatusBadge status={c.state} />
              <p className="mt-3">
                {c._count} {t("chuyển đổi")}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {t("Đối soát:")}
                {formatVnd(c._sum.estimatedVnd ?? "0")}
              </p>
              <p className="text-sm">
                {t("Đã quyết toán:")}
                {formatVnd(c._sum.settledVnd ?? "0")}
              </p>
            </div>
          ))}
        </div>
        {!data.commissions.length && (
          <p className="text-muted-foreground mt-3">{t("Chưa có chuyển đổi được ghi nhận.")}</p>
        )}
      </Card>
    </>
  );
}

export function UserDashboardPage() {
  const t = useCopy();

  return (
    <Page
      title={t("Mua sắm cùng BuyBack")}
      description="Dán link Shopee, xem hoa hồng dự kiến và bắt đầu mua sắm."
    >
      <GenerateLinkPanel />
      <CashbackOverview />
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("Đơn hàng gần đây")}</h2>
          <Link className="text-primary text-sm font-medium" href="/app/orders">
            {t("Xem tất cả")}
          </Link>
        </div>
        <RecentOrders />
      </section>
    </Page>
  );
}

export function RecentOrders() {
  const t = useCopy();

  const query = useFinance<FinanceList<OrderRow>>("me/orders?limit=3");
  if (query.isLoading) return <Loading />;
  if (query.isError)
    return <Failure message={query.error.message} retry={() => void query.refetch()} />;
  return (
    <div className="bg-card divide-y rounded-2xl border">
      {query.data?.data.length ? (
        query.data.data.map((row) => (
          <Link
            key={row.id}
            href={"/app/orders/" + row.id}
            className="hover:bg-muted/40 flex min-h-20 items-center justify-between gap-4 p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">
                {text(row, "productSummary.name") === "—"
                  ? text(row, "orderSn")
                  : text(row, "productSummary.name")}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">{text(row, "orderSn")}</p>
            </div>
            <StatusBadge domain="order" status={text(row, "status")} />
          </Link>
        ))
      ) : (
        <p className="text-muted-foreground p-5 text-sm">
          {t("Chưa có đơn hàng. Bắt đầu bằng cách tạo link mua sắm.")}
        </p>
      )}
    </div>
  );
}

export function CashbackOverview() {
  const t = useCopy();

  const query = useFinance<Dashboard>("me/dashboard");
  if (query.isLoading) return <Loading />;
  if (query.isError)
    return <Failure message={query.error.message} retry={() => void query.refetch()} />;
  if (!query.data) return null;
  const pending = query.data.cashbackSummary
    ?.filter((row) => ["PENDING", "VALIDATED"].includes(row.state))
    .reduce((sum, row) => sum + BigInt(row.userAmount), 0n);
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="border-primary/20 bg-secondary/50">
        <p className="text-muted-foreground text-sm">{t("Có thể rút")}</p>
        <p className="text-primary mt-2 text-3xl font-bold break-words tabular-nums">
          {formatVnd(query.data.wallet.available)}
        </p>
        <Link
          className="text-primary mt-3 inline-flex min-h-11 items-center font-medium"
          href="/app/withdrawals/new"
        >
          {t("Rút tiền")}
        </Link>
      </Card>
      <StatCard
        label="Cashback chờ xác nhận"
        value={pending === undefined ? "—" : formatVnd(pending)}
        helper="Chưa tính vào số dư có thể rút"
      />
      <StatCard label="Đang giữ cho yêu cầu rút" value={formatVnd(query.data.wallet.reserved)} />
    </div>
  );
}
