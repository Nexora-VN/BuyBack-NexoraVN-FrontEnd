"use client";

import { Button } from "@/components/ui/button";
import {
Check,
Copy,
ExternalLink,
ImageOff
} from "lucide-react";

import type { GenerateLinkState } from "../hooks/use-generate-link";
const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});
function formatAmount(value: string | null | undefined) {
  return value != null && /^\d+$/.test(value) ? money.format(BigInt(value)) : null;
}

export function GenerateLinkResult({ state }: { state: GenerateLinkState }) {
const {t, result, loading, product, imageFailed, setImageFailed, copy} = state;
return (        <div aria-live="polite" aria-busy={loading}>
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
                    <p className="text-muted-foreground mt-1 text-sm break-words">
                      {product.shopName}
                    </p>
                  )}
                  <p className="mt-2 font-semibold">
                    {formatAmount(product?.price) ?? t("Chưa có thông tin giá")}
                  </p>
                </div>
              </div>
              <div className="my-5 rounded-xl bg-white p-4">
                <p className="text-sm font-medium">{t("Số tiền được hoàn lại lên tới")}</p>
                {/* Use the provider commission directly; this is not a calculated user cashback share. */}
                <p className="text-primary mt-1 text-4xl font-bold break-words">
                  {formatAmount(product?.commission) ?? t("Chưa có thông tin hoa hồng")}
                </p>
                <p className="text-muted-foreground mt-2 text-xs leading-5">
                  {t(
                    "Lưu ý nhỏ nhỏ: Đây là tham khảo, con số chính xác sẽ có sau khi Shopee, TikTok xác nhận nhé..",
                  )}
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
        </div>
);
}
