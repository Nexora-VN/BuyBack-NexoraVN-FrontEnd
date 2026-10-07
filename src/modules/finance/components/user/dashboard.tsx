"use client";
import { useCopy } from "@/i18n/use-copy";

import { Card, StatCard } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatVnd } from "@/lib/format";
import { GenerateLinkPanel } from "@/modules/affiliate/components/generate-link-page";
import { GenerateLinkNotes } from "@/modules/affiliate/components/generate-link-notes";
import { useTranslations } from "next-intl";
import { useFinance } from "../../hooks/use-finance";
import { ArrowRight, ChevronRight, Clock3, WalletCards } from "lucide-react";
import type { Dashboard, OrderRow, FinanceList } from "../../types/finance";
import { Failure, Loading, text } from ".././finance-ui";
import { UserRecentOrdersSkeleton, UserWalletSkeleton } from "./user-skeletons";

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
  const endUser = useTranslations("EndUser");

  return (
    <Page
      title={endUser("homeTitle")}
      description={endUser("homeDescription")}
      className="user-home"
    >
      <div className="user-home-grid">
        <div data-tour="wallet-overview" className="min-w-0">
          <CashbackOverview />
        </div>
        <GenerateLinkPanel showNotes={false} />
      </div>
      <section className="space-y-3">
        <div className="flex items-center justify-between" data-tour="recent-orders">
          <h2 className="text-lg font-bold">{t("Đơn hàng gần đây")}</h2>
          <Link
            className="text-primary inline-flex min-h-11 items-center gap-1 text-sm font-semibold"
            href="/app/orders"
          >
            {t("Xem tất cả")} <ArrowRight className="size-4" />
          </Link>
        </div>
        <RecentOrders />
      </section>
      <GenerateLinkNotes />
    </Page>
  );
}

import { ProductThumbnail } from "@/components/patterns/product-thumbnail";
import { read } from "../finance-columns";

export function RecentOrders() {
  const t = useCopy();

  const query = useFinance<FinanceList<OrderRow>>("me/orders?limit=3");
  if (query.isLoading) return <UserRecentOrdersSkeleton />;
  if (query.isError)
    return <Failure message={query.error.message} retry={() => void query.refetch()} />;
  return (
    <div className="user-recent-list divide-y">
      {query.data?.data.length ? (
        <div className="user-recent-head">
          <span>{t("Sản phẩm")}</span>
          <span>{t("Giá mua")}</span>
          <span>{t("Tiền hoàn")}</span>
          <span>{t("Trạng thái đơn")}</span>
        </div>
      ) : null}
      {query.data?.data.length ? (
        query.data.data.map((row) => {
          const platform = (read(row, "productSummary.platform") || read(row, "platform")) as
            string | undefined;
          const imageUrl = read(row, "productSummary.imageUrl") as string | null;
          const productName =
            text(row, "productSummary.name") === "—"
              ? text(row, "orderSn")
              : text(row, "productSummary.name");
          const cashbackAmount = text(row, "checkout.commission.cashback.userAmount");
          const orderAmount = text(row, "totalAmountVnd");
          const itemCount = Number(read(row, "productSummary.itemCount") ?? 1);

          return (
            <Link
              key={row.id}
              href={"/app/orders/" + row.id}
              className="user-recent-row hover:bg-muted/40 flex items-center justify-between gap-3 p-4 transition-colors sm:px-6 sm:py-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <ProductThumbnail
                  src={imageUrl}
                  name={productName}
                  className="size-16 shrink-0 rounded-xl"
                />
                <div className="min-w-0 space-y-1">
                  <p className="line-clamp-2 text-sm font-semibold">{productName}</p>
                  <div className="flex items-center gap-2">
                    {platform && (
                      <span className="inline-flex items-center rounded-md border border-orange-200/60 bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-orange-600 uppercase">
                        {platform}
                      </span>
                    )}
                    <span className="text-muted-foreground hidden font-mono text-xs sm:inline">
                      {text(row, "orderSn")}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <span>
                      {itemCount} {t("sản phẩm")}
                    </span>
                    {cashbackAmount !== "—" && (
                      <span className="text-primary font-bold">+{formatVnd(cashbackAmount)}</span>
                    )}
                  </div>
                </div>
              </div>
              <span className="user-recent-price">
                {orderAmount === "—" ? "—" : formatVnd(orderAmount)}
              </span>
              <span className="user-recent-cashback">
                {cashbackAmount === "—" ? "—" : `+${formatVnd(cashbackAmount)}`}
              </span>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge domain="order" status={text(row, "status")} />
                <ChevronRight
                  aria-hidden="true"
                  className="text-muted-foreground hidden size-4 sm:block"
                />
              </div>
            </Link>
          );
        })
      ) : (
        <p className="text-muted-foreground p-5 text-sm">
          {t("Bạn chưa có đơn hàng nào cả. Tạo link mua sắm ngay nào.")}
        </p>
      )}
    </div>
  );
}

export function CashbackOverview() {
  const t = useCopy();

  const query = useFinance<Dashboard>("me/dashboard");
  if (query.isLoading) return <UserWalletSkeleton />;
  if (query.isError)
    return <Failure message={query.error.message} retry={() => void query.refetch()} />;
  if (!query.data) return null;
  const pending = query.data.cashbackSummary
    ?.filter((row) => ["PENDING", "VALIDATED"].includes(row.state))
    .reduce((sum, row) => sum + BigInt(row.userAmount), 0n);
  return (
    <Card className="user-wallet-card">
      <div className="user-wallet-top">
        <span className="user-icon-box">
          <WalletCards className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-sm">{t("Bạn có thể rút")}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight break-words tabular-nums">
            {formatVnd(query.data.wallet.available)}
          </p>
        </div>
        <Link className="user-primary-action" href="/app/withdrawals/new">
          {t("Rút tiền")}
        </Link>
      </div>
      <Link className="user-wallet-pending" href="/app/wallet">
        <Clock3 className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          {t("Số tiền chờ xác nhận")}{" "}
          <strong>{pending === undefined ? "—" : formatVnd(pending)}</strong>
        </span>
        <span className="user-wallet-pending-arrow" aria-hidden="true">
          <ChevronRight className="size-4" />
        </span>
      </Link>
      <p className="text-muted-foreground mt-2 text-xs">{t("Chưa tính vào số dư có thể rút")}</p>
      {BigInt(query.data.wallet.reserved || "0") > 0n && (
        <p className="text-muted-foreground mt-2 text-xs">
          {t("Đang giữ cho yêu cầu rút")}: {formatVnd(query.data.wallet.reserved)}
        </p>
      )}
    </Card>
  );
}
