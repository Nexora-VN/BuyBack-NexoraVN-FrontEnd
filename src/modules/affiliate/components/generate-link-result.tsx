"use client";

import { Button } from "@/components/ui/button";
import { Check, CircleHelp, Copy, ExternalLink, ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { GenerateLinkState } from "../hooks/use-generate-link";
import { PriceExplainerDialog } from "./price-explainer-dialog";

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

function formatAmount(value: string | null | undefined) {
  return value != null && /^\d+$/.test(value) ? money.format(BigInt(value)) : null;
}

function formatRate(rate: number): string {
  if (isNaN(rate)) return "0%";
  const cleanNumber = Math.round(rate * 100) / 100;
  return `${cleanNumber}%`;
}

export function GenerateLinkResult({ state }: { state: GenerateLinkState }) {
  const endUser = useTranslations("EndUser");
  const { t, result, loading, product, imageFailed, setImageFailed, copy } = state;
  const [explainerOpen, setExplainerOpen] = useState(false);

  const shopeeRatePercent =
    product?.shopeeRatePercent != null
      ? Number(product.shopeeRatePercent)
      : product?.shopeeRate != null
        ? Number(product.shopeeRate) * 100
        : 0;

  const sellerRatePercent =
    product?.sellerRatePercent != null
      ? Number(product.sellerRatePercent)
      : product?.sellerRate != null
        ? Number(product.sellerRate) * 100
        : 0;

  return (
    <div aria-live="polite" aria-busy={loading}>
      {result?.link && (
        <section
          className="border-success/20 bg-success-soft mt-6 rounded-2xl border p-4 sm:p-5"
          aria-label={t("Kết quả tạo link")}
        >
          <div className="text-success mb-4 flex items-center gap-2 text-sm font-semibold">
            <Check className="size-5" />
            {t("Piggy mang tới tin tốt cho bạn")}
          </div>
          <div className="flex items-start gap-4">
            <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-white sm:size-28">
              {product?.imageUrl && !imageFailed ? (
                // Provider images have dynamic hosts; retain native image loading and an error placeholder.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="size-full object-contain"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <ImageOff
                  className="text-muted-foreground size-8"
                  aria-label={t("Chưa có ảnh sản phẩm")}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold break-words">
                {product?.productName || t("Sản phẩm Shopee")}
              </h2>
              {product?.shopName && (
                <p className="text-muted-foreground mt-1 text-sm break-words">{product.shopName}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <p className="font-semibold">
                  {formatAmount(product?.price) ?? t("Chưa có thông tin giá")}
                </p>
                {Boolean(product?.isExtra || sellerRatePercent > 0) && (
                  <span className="bg-primary/10 text-primary rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                    Extra
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="my-5 rounded-xl bg-white p-4">
            <p className="text-sm font-medium">{endUser("estimatedCashback")}</p>
            {formatAmount(result.estimatedUserCashbackVnd) ? (
              <p className="text-primary mt-1 text-4xl font-bold break-words">
                {formatAmount(result.estimatedUserCashbackVnd)}
              </p>
            ) : (
              <p className="text-muted-foreground mt-1 font-semibold">
                {endUser("estimateUnavailable")}
              </p>
            )}
            <div className="text-muted-foreground mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setExplainerOpen(true)}
                className="group hover:text-foreground focus-visible:ring-primary text-muted-foreground inline-flex cursor-pointer flex-wrap items-center gap-1.5 rounded text-left text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
                title={t("Bấm để xem giải thích các loại giá và hoàn tiền")}
              >
                <span>
                  {t("Shopee hoàn")}:{" "}
                  <strong className="text-foreground font-semibold">
                    {formatRate(shopeeRatePercent)}
                  </strong>
                </span>
                <span className="text-muted-foreground/60" aria-hidden="true">
                  •
                </span>
                <span>
                  {t("Shopee Extra hoàn")}:{" "}
                  <strong className="text-foreground font-semibold">
                    {formatRate(sellerRatePercent)}
                  </strong>
                </span>
                <CircleHelp className="text-muted-foreground group-hover:text-primary size-3.5 shrink-0 transition-colors" />
              </button>
            </div>
            <p className="text-muted-foreground mt-2 text-xs leading-5">
              {endUser("estimateNote")}
            </p>
          </div>
          <div className="flex flex-col gap-3 xl:flex-row">
            <Button asChild size="lg">
              <a href={result.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                {t("Mua ngay")}
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={copy}
              className="h-auto min-h-11 whitespace-normal"
            >
              <Copy className="shrink-0" />
              {t("Copy link chia sẻ cho bạn bè")}
            </Button>
          </div>
        </section>
      )}
      <PriceExplainerDialog
        open={explainerOpen}
        onOpenChange={setExplainerOpen}
        product={product}
        estimatedUserCashbackVnd={result?.estimatedUserCashbackVnd}
      />
    </div>
  );
}
