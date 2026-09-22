"use client";
import { ProductThumbnail } from "@/components/patterns/product-thumbnail";
import { type Column } from "@/components/ui/data-table";
import { StatusBadge,type StatusDomain } from "@/components/ui/status-badge";
import { useCopy } from "@/i18n/use-copy";
import { formatDateTime,formatVnd } from "@/lib/format";
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
      if (key === "productSummary.name")
        return (
          <div className="flex min-w-0 items-center gap-3">
            <ProductThumbnail
              src={read(row, "productSummary.imageUrl") as string | null}
              name={value === "—" ? "" : value}
            />
            <div className="min-w-0">
              <span className="line-clamp-2 font-medium break-words">
                {value === "—" ? text(row, "orderSn") : value}
              </span>
              <span className="text-muted-foreground text-xs">
                {text(row, "productSummary.itemCount")} <CopyText value="sản phẩm" />
              </span>
            </div>
          </div>
        );
      if (value === "—") return value;
      if (type === "money")
        return <span className="font-semibold tabular-nums">{formatVnd(value)}</span>;
      if (type === "status")
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
      if (type === "date") return formatDateTime(value);
      return (
        <span className="block max-w-72 break-words">
          {key === "type" ? <CopyText value={value} /> : value}
        </span>
      );
    },
  }));
}
function CopyText({ value }: { value: string }) {
  const t = useCopy();
  return t(value);
}
