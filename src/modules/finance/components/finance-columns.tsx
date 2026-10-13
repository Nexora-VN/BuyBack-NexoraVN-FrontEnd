"use client";
import { ProductThumbnail } from "@/components/patterns/product-thumbnail";
import { type Column } from "@/components/ui/data-table";
import { StatusBadge, type StatusDomain } from "@/components/ui/status-badge";
import { useCopy } from "@/i18n/use-copy";
import { Link } from "@/i18n/navigation";
import { formatDateTime, formatVnd } from "@/lib/format";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { FinanceRow } from "../types/finance";

export function read(row: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (v, k) => (v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined),
      row,
    );
}

export const text = (row: unknown, path: string) => {
  const value = read(row, path);
  return value == null ? "—" : String(value);
};

export type Specs = [string, string, ("money" | "status" | "date")?][];

const issueLabels: Record<string, string> = {
  INVALID_ATTRIBUTION: "Không xác định được người nhận hoa hồng",
  PAID_COMMISSION_CHANGED: "Hoa hồng đã thanh toán bị thay đổi",
  UNKNOWN_PROVIDER_STATUS: "Trạng thái đơn từ đối tác chưa rõ",
  UNKNOWN_COMMISSION_STATUS: "Trạng thái hoa hồng từ đối tác chưa rõ",
  PARTIAL_CHECKOUT_REVIEW: "Đơn chỉ được xác nhận một phần",
  MCN_FEE_REVIEW: "Cần kiểm tra phí MCN",
  CANCELLED_WITH_COMMISSION: "Đơn hủy vẫn có hoa hồng",
  INVALID_ITEM_REFERENCE: "Mã sản phẩm từ đối tác không hợp lệ",
  AMBIGUOUS_ITEM_IDENTITY: "Không xác định rõ sản phẩm trong đơn",
  ACCOUNT_UNIT_UNVERIFIED: "Tài khoản hoặc đơn vị tiền chưa xác thực",
  AFFILIATE_ACCOUNT_MISMATCH: "Tài khoản affiliate không khớp",
  CROSS_PROVIDER_DUPLICATE: "Đơn bị trùng giữa các nguồn",
  ATTRIBUTION_CHANGED: "Người nhận hoa hồng đã thay đổi",
};
export const issueLabel = (code: string) => issueLabels[code] ?? code;
const auditLabels: Record<string, string> = {
  SHOPEE_CREDENTIAL_ROTATED: "Cập nhật kết nối Shopee",
  PROVIDER_ACCOUNT_UPDATED: "Cập nhật tài khoản đối tác",
  PROVIDER_ACCOUNT_VND_VERIFIED: "Xác thực tài khoản và tiền tệ",
  WITHDRAWAL_CREATED: "Tạo yêu cầu rút tiền",
  WITHDRAWAL_BANK_REVEALED: "Xem thông tin chuyển khoản",
  WALLET_ADJUSTED: "Điều chỉnh số dư ví",
  RECONCILIATION_QUEUED: "Bắt đầu đối soát",
  COMMISSION_REVERSED: "Thu hồi hoa hồng",
  ADDLIVETAG_CHECKOUT_REVIEWED: "Xử lý vấn đề đối soát",
  BANK_SUBMITTED: "Gửi nơi nhận tiền",
  BANK_REMOVED: "Gỡ nơi nhận tiền",
  BANK_APPROVED: "Duyệt nơi nhận tiền",
  BANK_REJECTED: "Từ chối nơi nhận tiền",
  SETTLEMENT_CREATED: "Tạo kỳ thanh toán",
  SETTLEMENT_CONFIRMED: "Xác nhận kỳ thanh toán",
  SETTLEMENT_DRAFT_CANCELLED: "Hủy kỳ thanh toán nháp",
};

export function columns(specs: Specs, domain: StatusDomain = "general"): Column<FinanceRow>[] {
  return specs.map(([key, label, type]) => ({
    key,
    label,
    mobilePrimary: ["productSummary.name", "checkout.checkoutId", "bankName", "orderSn"].includes(
      key,
    ),
    render: (row) => {
      const value = text(row, key);

      if (key === "user" || key === "actor") {
        const person = read(row, key) as {
          id?: string;
          email?: string;
          displayName?: string | null;
        } | null;
        if (!person) return <span className="text-muted-foreground">Chưa xác định</span>;
        return (
          <span className="block max-w-52 text-sm">
            <strong className="block break-words">
              {person.displayName || person.email || "Chưa đặt tên"}
            </strong>
            {person.email && person.displayName && (
              <span className="text-muted-foreground block text-xs break-all">{person.email}</span>
            )}
            {person.id && (
              <Link className="text-primary text-xs underline" href={`/admin/users/${person.id}`}>
                Xem người dùng
              </Link>
            )}
          </span>
        );
      }

      if (key === "type" && issueLabels[value])
        return (
          <span className="block max-w-64">
            <strong className="font-medium">{issueLabels[value]}</strong>
            <span className="text-muted-foreground block text-xs">{value}</span>
          </span>
        );

      if (key === "action")
        return (
          <span>
            <strong className="block font-medium">
              {auditLabels[value] || value.replaceAll("_", " ")}
            </strong>
            <span className="text-muted-foreground text-xs">{value}</span>
          </span>
        );

      if (key === "provider" || key === "checkout.provider") {
        if (value.startsWith("ADDLIVETAG"))
          return <span>AddLiveTag{value.includes(":") ? ` · TK ${value.split(":")[1]}` : ""}</span>;
      }

      if (key === "reference" && read(row, "source")) {
        const order = read(row, "source.order") as {
          orderSn?: string;
          productName?: string | null;
        } | null;
        const withdrawal = read(row, "source.withdrawal") as {
          bankName?: string | null;
          lastFour?: string | null;
        } | null;
        if (order)
          return (
            <span>
              {order.productName || `Đơn ${order.orderSn}`}
              {order.productName && (
                <span className="text-muted-foreground block text-xs">Đơn {order.orderSn}</span>
              )}
            </span>
          );
        if (withdrawal)
          return (
            <span>
              Rút về {withdrawal.bankName || "ngân hàng"} · •••• {withdrawal.lastFour || "—"}
            </span>
          );
      }
      if (key === "reference" && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value))
        return (
          <details className="text-muted-foreground text-xs">
            <summary className="cursor-pointer">Mã tham chiếu: {value.slice(0, 8)}…</summary>
            <span className="break-all">{value}</span>
          </details>
        );

      if (key === "productSummary.name") {
        const platform = (read(row, "productSummary.platform") || read(row, "platform")) as
          string | undefined;
        const itemCount = Number(read(row, "productSummary.itemCount") ?? 1);
        const imageUrl = read(row, "productSummary.imageUrl") as string | null;

        return (
          <div className="flex min-w-0 items-center gap-3 py-1">
            <ProductThumbnail
              src={imageUrl}
              name={value === "—" ? "" : value}
              className="size-14 shrink-0"
            />
            <div className="min-w-0 space-y-1">
              {platform && (
                <span className="inline-flex items-center rounded-md border border-orange-200/60 bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-orange-600 uppercase">
                  {platform}
                </span>
              )}
              <span className="line-clamp-2 text-sm leading-snug font-semibold break-words">
                {value === "—" ? text(row, "orderSn") : value}
              </span>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span>
                  {itemCount} <CopyText value="sản phẩm" />
                </span>
                {itemCount > 1 && (
                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
                    +{itemCount - 1} <CopyText value="khác" />
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }

      if (key === "orderSn") {
        const platform = (read(row, "platform") || read(row, "productSummary.platform")) as
          string | undefined;
        return (
          <div className="space-y-1 py-1">
            <div className="flex items-center gap-1.5 font-mono text-xs font-medium">
              <span className="truncate">{value}</span>
              <CopySnButton value={value} />
            </div>
            {platform && (
              <span className="text-muted-foreground block text-[11px]">{platform}</span>
            )}
          </div>
        );
      }

      if (value === "—") return value;

      if (key.includes("cashback") || key === "checkout.commission.cashback.userAmount") {
        return (
          <span className="text-success text-sm font-bold tabular-nums">+{formatVnd(value)}</span>
        );
      }

      if (type === "money") {
        return <span className="text-sm font-semibold tabular-nums">{formatVnd(value)}</span>;
      }

      if (type === "status") {
        return (
          <StatusBadge
            status={value}
            domain={
              key.includes("cashback")
                ? "cashback"
                : key.includes("commission")
                  ? "commission"
                  : domain
            }
          />
        );
      }

      if (type === "date") return formatDateTime(value);

      return (
        <span className="block max-w-72 break-words">
          {key === "type" ? <CopyText value={value} /> : value}
        </span>
      );
    },
  }));
}

function CopySnButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const t = useCopy();
  if (!value || value === "—") return null;

  return (
    <button
      type="button"
      title={t("Sao chép mã đơn")}
      className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-5 shrink-0 items-center justify-center rounded transition-colors"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopied(true);
            toast.success(t("Đã sao chép mã đơn"));
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => toast.error(t("Không thể sao chép")));
      }}
    >
      {copied ? <Check className="text-success size-3" /> : <Copy className="size-3" />}
    </button>
  );
}

function CopyText({ value }: { value: string }) {
  const t = useCopy();
  return t(value);
}
