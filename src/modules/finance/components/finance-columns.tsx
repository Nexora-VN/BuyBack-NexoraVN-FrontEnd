"use client";
import { ProductThumbnail } from "@/components/patterns/product-thumbnail";
import { type Column } from "@/components/ui/data-table";
import { StatusBadge, type StatusDomain } from "@/components/ui/status-badge";
import { useCopy } from "@/i18n/use-copy";
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

export function columns(specs: Specs, domain: StatusDomain = "general"): Column<FinanceRow>[] {
  return specs.map(([key, label, type]) => ({
    key,
    label,
    mobilePrimary: ["productSummary.name", "checkout.checkoutId", "bankName", "orderSn"].includes(
      key,
    ),
    render: (row) => {
      const value = text(row, key);

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
