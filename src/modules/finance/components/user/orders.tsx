"use client";
import { SettlementEligibility } from "../settlement-eligibility";
import { useCopy } from "@/i18n/use-copy";

import { ProductThumbnail } from "@/components/patterns/product-thumbnail";
import { Card } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatDateTime, formatVnd } from "@/lib/format";
import {
  ArrowDownToLine,
  Check,
  CircleAlert,
  Clock3,
  Copy,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useFinance } from "../../hooks/use-finance";
import type { FinanceRow } from "../../types/finance";
import { Failure, FinanceTable, Loading, read, text } from ".././finance-ui";

export const orderSpecs: [string, string, ("money" | "status" | "date")?][] = [
  ["productSummary.name", "Sản phẩm"],
  ["orderSn", "Mã đơn & Sàn"],
  ["checkout.purchasedAt", "Ngày mua", "date"],
  ["totalAmountVnd", "Giá mua", "money"],
  ["status", "Trạng thái đơn", "status"],
  ["checkout.commission.state", "Đối soát", "status"],
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
            className="text-primary inline-flex min-h-11 items-center font-medium underline"
            href={"/app/orders/" + row.id}
          >
            {t("Chi tiết")}
          </Link>
        )}
      />
    </Page>
  );
}

function CashbackProgressStepper({
  orderStatus,
  commissionState,
  cashbackState,
  purchasedAt,
}: {
  orderStatus: string;
  commissionState: string;
  cashbackState?: string;
  purchasedAt?: string;
}) {
  const t = useCopy();

  const isCancelled =
    ["REJECTED", "FAILED", "CANCELLED", "cancelled"].includes(orderStatus) ||
    ["REJECTED", "REVERSED"].includes(commissionState) ||
    ["REJECTED", "REVERSED"].includes(cashbackState ?? "");

  const isWithdrawn =
    ["PAID", "WITHDRAWN"].includes(cashbackState ?? "") || commissionState === "PAID";

  const isAvailable = isWithdrawn || cashbackState === "AVAILABLE";

  const isOrderCompleted =
    isAvailable || ["VALIDATED", "COMPLETED", "completed", "APPROVED"].includes(orderStatus);

  const steps = [
    {
      title: t("Đã ghi nhận"),
      desc: purchasedAt ? formatDateTime(purchasedAt) : t("Ghi nhận qua Piggy"),
      done: true,
      current: false,
    },
    {
      title: t("Đơn hoàn tất"),
      desc: isOrderCompleted ? t("Giao thành công") : t("Đang giao hàng"),
      done: isOrderCompleted,
      current: !isOrderCompleted && !isCancelled,
    },
    {
      title: t("Đối soát hoa hồng"),
      desc: isAvailable ? t("Đã đối soát xong") : t("Sàn đang đối soát"),
      done: isAvailable,
      current: isOrderCompleted && !isAvailable && !isCancelled,
    },
    {
      title: isWithdrawn ? t("Đã rút tiền") : t("Tiền vào ví"),
      desc: isWithdrawn
        ? t("Đã chuyển về ngân hàng")
        : isAvailable
          ? t("Sẵn sàng rút tiền")
          : t("Chờ hoàn tất đối soát"),
      done: isWithdrawn || isAvailable,
      current: isAvailable && !isWithdrawn && !isCancelled,
    },
  ];

  if (isCancelled) {
    return (
      <div className="border-danger/30 bg-danger-soft text-danger flex items-center gap-3 rounded-2xl border p-4">
        <CircleAlert className="size-5 shrink-0" />
        <div>
          <p className="font-semibold">{t("Đơn hàng hoặc hoa hồng không hợp lệ")}</p>
          <p className="text-xs opacity-90">
            {t(
              "Đơn hàng này đã bị hủy, đổi trả hoặc không thỏa mãn điều kiện tích lũy của sàn thương mại điện tử.",
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          {t("Tiến trình tích lũy hoàn tiền")}
        </h3>
        {isWithdrawn ? (
          <span className="text-info inline-flex items-center gap-1 text-xs font-semibold">
            <ArrowDownToLine className="size-3.5" />
            {t("Đã rút tiền về ngân hàng")}
          </span>
        ) : isAvailable ? (
          <span className="text-success inline-flex items-center gap-1 text-xs font-semibold">
            <Check className="size-3.5" />
            {t("Sẵn sàng rút tiền")}
          </span>
        ) : (
          <span className="text-warning inline-flex items-center gap-1 text-xs font-semibold">
            <Clock3 className="size-3.5" />
            {t("Đang trong chu kỳ đối soát")}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {steps.map((s, idx) => (
          <div key={idx} className="relative flex flex-col items-start gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  s.done
                    ? isWithdrawn && idx === 3
                      ? "bg-info text-white"
                      : "bg-success text-white"
                    : s.current
                      ? "border-warning bg-warning-soft text-warning border-2"
                      : "border-border bg-muted text-muted-foreground border"
                }`}
              >
                {s.done ? (
                  isWithdrawn && idx === 3 ? (
                    <ArrowDownToLine className="size-3.5" />
                  ) : (
                    <Check className="size-3.5" />
                  )
                ) : s.current ? (
                  <Clock3 className="size-3.5" />
                ) : (
                  idx + 1
                )}
              </span>
              <p
                className={`text-sm font-semibold ${
                  s.done
                    ? isWithdrawn && idx === 3
                      ? "text-info"
                      : "text-success"
                    : s.current
                      ? "text-warning"
                      : "text-muted-foreground"
                }`}
              >
                {s.title}
              </p>
            </div>
            <p className="text-muted-foreground pl-9 text-xs sm:pl-0">{s.desc}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function UserOrderDetailPage({ id, admin = false }: { id: string; admin?: boolean }) {
  const t = useCopy();
  const [copied, setCopied] = useState(false);

  const query = useFinance<FinanceRow>((admin ? "admin/" : "me/") + "orders/" + id);
  if (query.isLoading) return <Loading />;
  if (query.isError)
    return <Failure message={query.error.message} retry={() => void query.refetch()} />;
  if (!query.data) return null;

  const data = query.data;
  const orderSn = text(data, "orderSn");
  const platform = (read(data, "platform") ||
    read(data, "productSummary.platform") ||
    "Shopee") as string;
  const orderStatus = text(data, "status");
  const commissionState = text(data, "checkout.commission.state");
  const cashbackState = read(data, "checkout.commission.cashback.state") as string | undefined;
  const cashbackAmount = text(data, "checkout.commission.cashback.userAmount");
  const totalAmountVnd = text(data, "totalAmountVnd");
  const purchasedAt = read(data, "checkout.purchasedAt") as string | undefined;
  const items = (read(data, "items") as FinanceRow[]) ?? [];

  const copyOrderSn = () => {
    if (!orderSn || orderSn === "—") return;
    navigator.clipboard
      .writeText(orderSn)
      .then(() => {
        setCopied(true);
        toast.success(t("Đã sao chép mã đơn"));
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error(t("Không thể sao chép")));
  };

  // Compute total if not already given
  const computedTotal =
    totalAmountVnd !== "—"
      ? totalAmountVnd
      : items
          .reduce((sum, item) => {
            const raw = text(item, "actualAmountRaw");
            const scale = text(item, "scale") === "100000" ? 100000n : 1n;
            return sum + (raw === "—" ? 0n : BigInt(raw) / scale);
          }, 0n)
          .toString();

  const userBps = read(data, "checkout.commission.cashback.userBps");
  const ratePercent = userBps ? `${Number(userBps) / 100}%` : "85%";

  return (
    <Page
      title={t("Chi tiết đơn hàng")}
      description={
        purchasedAt ? `${t("Thời gian đặt hàng:")} ${formatDateTime(purchasedAt)}` : undefined
      }
      badge={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-orange-200/60 bg-orange-50 px-2 py-0.5 text-xs font-bold tracking-wider text-orange-600 uppercase">
            {platform}
          </span>
          <span className="font-mono text-base font-semibold">#{orderSn}</span>
          <button
            type="button"
            onClick={copyOrderSn}
            className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-7 items-center justify-center rounded-lg border transition-colors"
            title={t("Sao chép mã đơn")}
          >
            {copied ? <Check className="text-success size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      }
    >
      {/* 1. Header Overview Card */}
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-muted-foreground mb-1 text-xs">{t("Trạng thái đơn hàng")}</p>
            <StatusBadge domain="order" status={orderStatus} />
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-xs">{t("Trạng thái hoa hồng")}</p>
            <StatusBadge domain="commission" status={commissionState} />
          </div>
          {cashbackState && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs">{t("Trạng thái hoàn tiền")}</p>
              <StatusBadge domain="cashback" status={cashbackState} />
            </div>
          )}
        </div>

        <div className="flex flex-col items-start sm:items-end">
          <span className="text-muted-foreground text-xs">{t("Tiền hoàn tích lũy")}</span>
          <span className="text-success text-2xl font-black tabular-nums">
            +{formatVnd(cashbackAmount === "—" ? "0" : cashbackAmount)}
          </span>
        </div>
      </Card>

      {/* 2. Visual Progress Stepper */}
      <CashbackProgressStepper
        orderStatus={orderStatus}
        commissionState={commissionState}
        cashbackState={cashbackState}
        purchasedAt={purchasedAt}
      />

      {/* 3. Products List in Order */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary size-5" />
            <h2 className="font-semibold">
              {t("Sản phẩm trong đơn")} ({items.length})
            </h2>
          </div>
          <span className="text-muted-foreground text-xs">
            {t("Tổng cộng:")}{" "}
            <strong>
              {items.length} {t("sản phẩm")}
            </strong>
          </span>
        </div>

        <div className="divide-y">
          {items.map((item) => {
            const itemScale = text(item, "scale") === "100000" ? 100000n : 1n;
            const rawAmount = text(item, "actualAmountRaw");
            const actualAmountVnd = rawAmount === "—" ? 0n : BigInt(rawAmount) / itemScale;
            const rawPrice = text(item, "itemPriceRaw");
            const itemPriceVnd = rawPrice === "—" ? actualAmountVnd : BigInt(rawPrice) / itemScale;
            const itemName =
              text(item, "itemName") === "—"
                ? text(item, "payload.item_name")
                : text(item, "itemName");
            const imageUrl = (read(item, "image") ||
              read(item, "imageUrl") ||
              read(item, "payload.image")) as string | null;
            const itemUrl = (read(item, "itemUrl") ||
              read(item, "item_url") ||
              read(item, "payload.item_url")) as string | null;
            const qty = Number(read(item, "qty") ?? 1);
            const itemStatus = text(item, "status");
            const commissionStatus = text(item, "commissionStatus");

            return (
              <div key={item.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
                <ProductThumbnail
                  src={imageUrl}
                  name={itemName}
                  className="size-20 shrink-0 shadow-xs"
                />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm leading-snug font-semibold break-words">
                      {itemName}
                    </p>
                  </div>

                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                    <span className="bg-muted inline-flex items-center rounded-md px-2 py-0.5 font-medium">
                      {t("Số lượng:")} x{qty}
                    </span>
                    <span>
                      {t("Đơn giá:")}{" "}
                      <strong className="text-foreground">
                        {itemPriceVnd === 0n ? t("0 đ (Quà tặng)") : formatVnd(itemPriceVnd)}
                      </strong>
                    </span>
                    {itemUrl && (
                      <a
                        href={itemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-medium underline"
                      >
                        {t("Xem trên sàn")}
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <StatusBadge status={itemStatus} domain="order" />
                    {commissionStatus !== "—" && (
                      <StatusBadge status={commissionStatus} domain="commission" />
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-row items-center justify-between border-t pt-2 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                  <span className="text-muted-foreground text-xs sm:hidden">
                    {t("Thành tiền:")}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold tabular-nums">
                      {actualAmountVnd === 0n ? t("0 đ (Quà tặng)") : formatVnd(actualAmountVnd)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 4. Financial Summary / Receipt Box */}
      <Card className="space-y-4">
        <h3 className="font-semibold">{t("Chi tiết dòng tiền & Tích lũy")}</h3>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("Tổng giá trị mua hàng:")}</span>
            <span className="font-semibold tabular-nums">{formatVnd(computedTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("Tỷ lệ tích lũy Piggy Back:")}</span>
            <span className="text-primary font-semibold tabular-nums">{ratePercent}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2.5">
            <span className="font-semibold">{t("Tiền hoàn thực nhận:")}</span>
            <span className="text-success text-lg font-bold tabular-nums">
              +{formatVnd(cashbackAmount === "—" ? "0" : cashbackAmount)}
            </span>
          </div>
        </div>

        {/* Withdrawal prompt */}
        {cashbackState === "AVAILABLE" && (
          <div className="bg-success-soft border-success/30 flex items-center justify-between rounded-xl border p-3">
            <div className="flex items-center gap-2">
              <Wallet className="text-success size-5" />
              <span className="text-success text-xs font-semibold">
                {t("Số tiền này đã sẵn sàng rút về tài khoản ngân hàng của bạn!")}
              </span>
            </div>
            <Link
              href="/app/withdrawals/new"
              className="bg-success text-success-foreground hover:bg-success/90 inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs"
            >
              {t("Rút tiền ngay")}
            </Link>
          </div>
        )}

        {/* Policy Explainer Callout */}
        <div className="bg-muted/50 text-muted-foreground flex gap-2.5 rounded-xl p-3.5 text-xs leading-relaxed">
          <ShieldCheck className="text-primary mt-0.5 size-4 shrink-0" />
          <p>
            <strong>{t("Chính sách đối soát:")}</strong>{" "}
            {t(
              "Hoa hồng đơn hàng từ Shopee & TikTok Shop cần thời gian đối soát từ 30 đến 45 ngày để xác nhận hoàn tất (không đổi trả hoặc phát sinh khiếu nại). Sau khi sàn hoàn tất quyết toán, tiền sẽ tự động chuyển sang trạng thái 'Có thể rút'.",
            )}
          </p>
        </div>
      </Card>

      {/* 5. Admin Technical Section */}
      {admin && (
        <Card className="border-warning/40 bg-warning-soft/20 space-y-3">
          <h3 className="text-warning-foreground font-semibold">
            {t("Quản trị hệ thống (Admin & Đối soát nội bộ)")}
          </h3>
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <p>
              {t("Provider:")} <strong>{text(query.data, "provider")}</strong>
            </p>
            <p>
              {t("Hoa hồng đối soát (VND):")}{" "}
              <strong>
                {formatVnd(
                  text(query.data, "checkout.commission.estimatedVnd") === "—"
                    ? "0"
                    : text(query.data, "checkout.commission.estimatedVnd"),
                )}
              </strong>
            </p>
          </div>
          {text(query.data, "checkout.utmContent") !== "—" && (
            <div className="bg-background/80 rounded-lg border p-2.5 font-mono text-[11px] break-all">
              <span className="text-muted-foreground font-semibold">{t("Attribution UTM: ")}</span>
              {text(query.data, "checkout.utmContent")}
            </div>
          )}
          {Boolean(query.data.settlementEligibility) && (
            <div className="pt-2">
              <h4 className="mb-2 text-xs font-semibold">{t("Điều kiện quyết toán")}</h4>
              <SettlementEligibility value={query.data.settlementEligibility} />
            </div>
          )}
        </Card>
      )}
    </Page>
  );
}
