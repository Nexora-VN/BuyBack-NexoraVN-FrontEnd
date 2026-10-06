"use client";
import { useCopy } from "@/i18n/use-copy";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Column } from "@/components/ui/data-table";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatVnd } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import {
  ArrowDownLeft,
  CircleCheck,
  Clock3,
  History,
  Coins,
  Landmark,
  Plus,
  LockKeyhole,
  RotateCcw,
  ShoppingBag,
  SlidersHorizontal,
  Wallet,
  WalletCards,
} from "lucide-react";
import { useFinance } from "../../hooks/use-finance";
import type {
  CashbackRow,
  Dashboard,
  FinanceRow,
  TransactionSource,
  WalletTransactionRow,
} from "../../types/finance";
import { Failure, FinanceTable, text } from ".././finance-ui";
import { UserWalletSkeleton } from "./user-skeletons";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function orderHref(source?: TransactionSource) {
  if (source?.orders && source.orders.length > 1) return undefined;
  const id = source?.order?.id || source?.orders?.[0]?.id;
  return id ? `/app/orders/${encodeURIComponent(id)}` : undefined;
}

function SourceContext({
  source,
  linkOrder = false,
}: {
  source?: TransactionSource;
  linkOrder?: boolean;
}) {
  const t = useCopy();
  const order = source?.order ?? source?.orders?.[0];
  const orders = source?.orders;
  const withdrawal = source?.withdrawal;
  if (orders && orders.length > 1) {
    return (
      <div className="text-muted-foreground min-w-0 space-y-1 text-xs">
        <p className="font-medium">
          {t("Đơn hàng")} ({orders.length})
        </p>
        {orders.map((item) => {
          const orderSn = item.orderSn && !uuidPattern.test(item.orderSn) ? item.orderSn : null;
          return (
            <Link
              href={`/app/orders/${encodeURIComponent(item.id)}`}
              className="hover:text-primary block rounded-md py-1 break-words underline decoration-dotted underline-offset-4"
              key={item.id}
            >
              {[item.productName, item.platform].filter(Boolean).join(" · ")}
              {orderSn && (
                <>
                  {item.productName || item.platform ? " · " : ""}
                  {t("Mã đơn hàng")}: {orderSn}
                </>
              )}
            </Link>
          );
        })}
      </div>
    );
  }
  if (order) {
    const orderSn = order.orderSn && !uuidPattern.test(order.orderSn) ? order.orderSn : null;
    const content = (
      <div className="text-muted-foreground min-w-0 space-y-0.5 text-xs">
        {order.productName && <p className="line-clamp-2 break-words">{order.productName}</p>}
        {(orderSn || order.platform) && (
          <p className="break-words">
            {order.platform && <span className="font-medium uppercase">{order.platform}</span>}
            {order.platform && orderSn && <span aria-hidden="true"> · </span>}
            {orderSn && (
              <span>
                {t("Mã đơn hàng")}: {orderSn}
              </span>
            )}
          </p>
        )}
      </div>
    );
    const href = orderHref(source);
    return linkOrder && href ? (
      <Link
        href={href}
        className="hover:text-primary block rounded-md underline decoration-dotted underline-offset-4"
      >
        {content}
      </Link>
    ) : (
      content
    );
  }
  if (withdrawal) {
    const bank = [withdrawal.bankName, withdrawal.lastFour ? `•••• ${withdrawal.lastFour}` : null]
      .filter(Boolean)
      .join(" · ");
    return bank ? <p className="text-muted-foreground text-xs break-words">{bank}</p> : null;
  }
  return null;
}

const walletEvents = {
  CASHBACK_CREDIT: { label: "Hoàn tiền đã cộng", icon: ArrowDownLeft },
  CASHBACK_REVERSAL: { label: "Thu hồi hoàn tiền", icon: RotateCcw },
  WITHDRAWAL_RESERVE: { label: "Giữ tiền để rút", icon: LockKeyhole },
  WITHDRAWAL_COMPLETE: { label: "Rút tiền hoàn tất", icon: CircleCheck },
  WITHDRAWAL_RELEASE: { label: "Hoàn lại tiền giữ", icon: ArrowDownLeft },
  MANUAL_ADJUSTMENT: { label: "Điều chỉnh số dư", icon: SlidersHorizontal },
} as const;

function WalletEvent({ row }: { row: WalletTransactionRow }) {
  const t = useCopy();
  const event = walletEvents[row.type as keyof typeof walletEvents];
  const Icon = event?.icon ?? Wallet;
  const label = t(event?.label ?? "Giao dịch ví");
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span
        className="bg-secondary text-primary grid size-9 shrink-0 place-items-center rounded-xl"
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 space-y-1">
        <p className="font-semibold break-words">{label}</p>
        <SourceContext source={row.source} linkOrder />
      </div>
    </div>
  );
}

function WalletTransactionMobile({ row }: { row: WalletTransactionRow }) {
  const t = useCopy();
  const event = walletEvents[row.type as keyof typeof walletEvents];
  const Icon = event?.icon ?? Wallet;
  const availableDelta = BigInt(row.availableDelta || "0");
  const reservedDelta = BigInt(row.reservedDelta || "0");
  const delta =
    row.type === "WITHDRAWAL_COMPLETE" || (availableDelta === 0n && reservedDelta !== 0n)
      ? reservedDelta
      : availableDelta;
  const amount =
    delta === 0n ? "—" : `${delta > 0n ? "+" : "−"}${formatVnd(delta > 0n ? delta : -delta)}`;
  const createdAt = text(row, "createdAt");
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span
        className="bg-secondary text-primary grid size-9 shrink-0 place-items-center rounded-xl"
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-bold break-words">{t(event?.label ?? "Giao dịch ví")}</p>
        {createdAt !== "—" && (
          <p className="text-muted-foreground text-xs">{formatDateTime(createdAt)}</p>
        )}
        <SourceContext source={row.source} />
        {row.availableAfter && (
          <p className="text-muted-foreground text-xs">
            {t("Có thể rút sau giao dịch")}: {formatVnd(row.availableAfter)}
          </p>
        )}
      </div>
      <strong
        className={`shrink-0 text-sm tabular-nums ${delta > 0n ? "text-primary" : "text-danger"}`}
      >
        {amount}
      </strong>
    </div>
  );
}

function BalanceDelta({ value }: { value: string }) {
  const amount = BigInt(value || "0");
  if (amount === 0n) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={`font-semibold tabular-nums ${amount > 0n ? "text-success" : "text-foreground"}`}
    >
      {amount > 0n ? "+" : "−"}
      {formatVnd(amount > 0n ? amount : -amount)}
    </span>
  );
}

function CashbackEvent({ row }: { row: CashbackRow }) {
  const t = useCopy();
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span
        className="bg-secondary text-primary grid size-9 shrink-0 place-items-center rounded-xl"
        aria-hidden="true"
      >
        <ShoppingBag className="size-4" />
      </span>
      <div className="min-w-0 space-y-1">
        <p className="font-semibold">{t("Hoàn tiền đơn hàng")}</p>
        <SourceContext source={row.source} linkOrder />
      </div>
    </div>
  );
}

const cashbackColumns: Column<FinanceRow>[] = [
  {
    key: "order",
    label: "Đơn hàng",
    mobilePrimary: true,
    render: (row) => <CashbackEvent row={row as CashbackRow} />,
  },
];

const walletColumns: Column<FinanceRow>[] = [
  {
    key: "event",
    label: "Giao dịch",
    mobilePrimary: true,
    render: (row) => <WalletEvent row={row as WalletTransactionRow} />,
  },
  {
    key: "availableDelta",
    label: "Thay đổi khả dụng",
    render: (row) => <BalanceDelta value={(row as WalletTransactionRow).availableDelta} />,
  },
  {
    key: "reservedDelta",
    label: "Thay đổi đang giữ",
    render: (row) => <BalanceDelta value={(row as WalletTransactionRow).reservedDelta} />,
  },
];

export function CashbackPage() {
  const t = useCopy();

  return (
    <Page
      title="Lịch sử hoàn tiền"
      description="Tiền hoàn từ đơn hàng sẽ có thể rút sau khi được xác nhận và quyết toán."
    >
      <FinanceTable
        path="me/cashbacks"
        mobileHref={(row) => orderHref((row as CashbackRow).source)}
        searchLabel="Mã đơn hàng"
        states={["PENDING", "VALIDATED", "AVAILABLE", "REJECTED", "REVERSED"]}
        hideMobileControls
        mobileStatusChips={[
          { label: t("Tất cả"), value: "" },
          { label: t("Chờ xác nhận"), value: "PENDING" },
          { label: t("Chờ đối soát"), value: "VALIDATED" },
          { label: t("Có thể rút"), value: "AVAILABLE" },
          { label: t("Đã từ chối"), value: "REJECTED" },
          { label: t("Đã thu hồi"), value: "REVERSED" },
        ]}
        mobileRender={(row) => {
          const state = text(row, "state");
          const amount = text(row, "userAmount");
          const cancelled = ["REJECTED", "REVERSED"].includes(state);
          const createdAt = text(row, "createdAt");
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Coins className="text-primary size-5 shrink-0" aria-hidden="true" />
                <span>{t("Hoàn tiền đơn hàng")}</span>
              </div>
              <SourceContext source={(row as CashbackRow).source} />
              <div>
                <p className="text-muted-foreground text-xs">
                  {state === "AVAILABLE"
                    ? t("Tiền hoàn có thể rút")
                    : cancelled
                      ? t("Tiền hoàn không khả dụng")
                      : t("Tiền hoàn dự kiến")}
                </p>
                <p
                  className={`text-lg font-extrabold tabular-nums ${cancelled ? "text-danger" : "text-success"}`}
                >
                  {amount === "—" ? amount : `${cancelled ? "" : "+"}${formatVnd(amount)}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge domain="cashback" status={state} />
                {createdAt !== "—" && (
                  <span className="text-muted-foreground text-xs">{formatDateTime(createdAt)}</span>
                )}
              </div>
            </div>
          );
        }}
        extraColumns={cashbackColumns}
        specs={[
          ["userAmount", t("Tiền hoàn"), "money"],
          ["state", t("Trạng thái"), "status"],
          ["createdAt", t("Ghi nhận"), "date"],
        ]}
      />
    </Page>
  );
}

export function WalletPage() {
  const t = useCopy();
  const endUser = useTranslations("EndUser");

  const wallet = useFinance<Dashboard>("me/dashboard");
  const pending = wallet.data?.cashbackSummary
    ?.filter((row) => ["PENDING", "VALIDATED"].includes(row.state))
    .reduce((sum, row) => sum + BigInt(row.userAmount), 0n);
  return (
    <Page
      title={t("Ví của bạn")}
      description={endUser("walletDescription")}
      className="user-wallet-page"
      actions={
        <Button asChild>
          <Link href="/app/withdrawals/new">{t("Yêu cầu rút")}</Link>
        </Button>
      }
    >
      {wallet.isLoading ? (
        <UserWalletSkeleton showAction={false} />
      ) : wallet.isError ? (
        <Failure message={wallet.error.message} retry={() => void wallet.refetch()} />
      ) : wallet.data ? (
        <Card className="user-wallet-card space-y-4">
          <div className="flex items-center gap-3">
            <span className="user-icon-box">
              <WalletCards className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-muted-foreground text-sm">{t("Bạn có thể rút")}</p>
              <p className="text-2xl font-extrabold tabular-nums">
                {formatVnd(wallet.data.wallet.available)}
              </p>
            </div>
          </div>
          <div className="space-y-3 border-t pt-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock3 className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              <span className="text-muted-foreground flex-1">{endUser("walletPendingShort")}</span>
              <strong className="text-primary tabular-nums">
                {pending === undefined ? "—" : formatVnd(pending)}
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <LockKeyhole className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              <span className="text-muted-foreground flex-1">{endUser("walletHeld")}</span>
              <strong className="tabular-nums">{formatVnd(wallet.data.wallet.reserved)}</strong>
            </div>
          </div>
        </Card>
      ) : null}
      <div className="flex flex-col gap-3 lg:flex-row">
        <Button asChild variant="outline" className="w-full lg:w-auto">
          <Link href="/app/cashback" className="flex items-center justify-center gap-2">
            <ArrowDownLeft className="size-4" aria-hidden="true" />
            {t("Lịch sử hoàn tiền")}
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full lg:w-auto">
          <Link href="/app/withdrawals" className="flex items-center justify-center gap-2">
            <History className="size-4" aria-hidden="true" />
            {t("Lịch sử rút tiền")}
          </Link>
        </Button>
      </div>
      {wallet.data && BigInt(wallet.data.wallet.available) < 0n && (
        <Card role="alert">
          {t(
            "Ví đang có khoản hoàn trả sau điều chỉnh đơn hàng. Bạn có thể rút tiếp khi số dư khả dụng đủ mức tối thiểu.",
          )}
        </Card>
      )}
      <h2 className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
        {endUser("transactionHistory")}
      </h2>
      <FinanceTable
        path="me/wallet/transactions"
        mobileHref={(row) => orderHref((row as WalletTransactionRow).source)}
        hideMobileControls
        mobileGroup
        mobileRender={(row) => <WalletTransactionMobile row={row as WalletTransactionRow} />}
        searchLabel="Mã đơn hàng"
        extraColumns={walletColumns}
        specs={[
          ["availableAfter", t("Khả dụng sau giao dịch"), "money"],
          ["createdAt", t("Thời gian"), "date"],
        ]}
      />
    </Page>
  );
}

export function WithdrawalHistoryPage() {
  const t = useCopy();
  const endUser = useTranslations("EndUser");

  return (
    <Page
      title={t("Lịch sử rút tiền")}
      className="user-withdrawal-history"
      actions={
        <Button asChild variant="outline">
          <Link href="/app/withdrawals/new">
            <Plus className="size-4" aria-hidden="true" />
            {t("Rút tiền")}
          </Link>
        </Button>
      }
    >
      <FinanceTable
        path="me/withdrawals"
        searchLabel="Mã chuyển khoản"
        emptyTitle={endUser("withdrawalsEmptyTitle")}
        emptyDescription={endUser("withdrawalsEmptyDescription")}
        states={["PENDING", "PROCESSING", "COMPLETED", "REJECTED", "FAILED"]}
        hideMobileControls
        mobileRender={(row) => {
          const createdAt = text(row, "createdAt");
          const reason = text(row, "reviewReason");
          return (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-base tabular-nums">{formatVnd(text(row, "amount"))}</strong>
                <StatusBadge domain="withdrawal" status={text(row, "status")} />
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Landmark className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">
                  {text(row, "bank.bankName")} (•••• {text(row, "bank.lastFour")})
                </span>
              </div>
              {createdAt !== "—" && (
                <p className="text-muted-foreground text-xs">
                  {t("Thời gian tạo")}: {formatDateTime(createdAt)}
                </p>
              )}
              {reason !== "—" && (
                <p className="bg-danger-soft text-danger rounded-lg p-2 text-xs">{reason}</p>
              )}
            </div>
          );
        }}
        specs={[
          ["amount", t("Số tiền"), "money"],
          ["status", t("Trạng thái"), "status"],
          ["bank.bankName", t("Ngân hàng")],
          ["bank.lastFour", t("4 số cuối")],
          ["createdAt", t("Ngày tạo"), "date"],
          ["id", t("Mã yêu cầu")],
        ]}
      />
    </Page>
  );
}
