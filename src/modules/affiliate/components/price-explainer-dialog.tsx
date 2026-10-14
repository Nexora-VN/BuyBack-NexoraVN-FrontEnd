"use client";

import { SurfaceDialog } from "@/components/patterns/surface-dialog";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/i18n/use-copy";
import type { GeneratedProduct } from "../types/affiliate";
import { CheckCircle2, Clock, Coins, Sparkles, Store, Tag } from "lucide-react";

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

function formatAmount(value: string | number | null | undefined) {
  if (value == null) return null;
  const str = String(value);
  return /^\d+$/.test(str) ? money.format(BigInt(str)) : null;
}

function formatRate(rate: number): string {
  if (isNaN(rate)) return "0%";
  const cleanNumber = Math.round(rate * 100) / 100;
  return `${cleanNumber}%`;
}

interface PriceExplainerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: GeneratedProduct | null;
  estimatedUserCashbackVnd?: string | null;
}

export function PriceExplainerDialog({
  open,
  onOpenChange,
  product,
  estimatedUserCashbackVnd,
}: PriceExplainerDialogProps) {
  const t = useCopy();

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

  const totalRatePercent =
    product?.totalRatePercent != null
      ? Number(product.totalRatePercent)
      : shopeeRatePercent + sellerRatePercent;

  return (
    <SurfaceDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("Giải thích các loại giá & hoàn tiền")}
      compact
    >
      <div className="space-y-4">
        {/* Tóm tắt thông số sản phẩm hiện tại */}
        {product && (
          <div className="bg-muted/40 rounded-xl border p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {t("Thông số đơn hàng này")}
              </span>
              {Boolean(product.isExtra || sellerRatePercent > 0) && (
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                  Hoa hồng bổ sung
                </span>
              )}
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-background rounded-lg border p-2.5 shadow-xs">
                <span className="text-muted-foreground block text-[11px]">{t("Giá niêm yết")}</span>
                <span className="text-foreground mt-0.5 block font-semibold">
                  {formatAmount(product.price) ?? t("Chưa có")}
                </span>
              </div>
              <div className="bg-background rounded-lg border p-2.5 shadow-xs">
                <span className="text-muted-foreground block text-[11px]">
                  {t("Tổng hoàn sàn")}
                </span>
                <span className="text-foreground mt-0.5 block font-semibold">
                  {formatRate(totalRatePercent)}
                </span>
              </div>
              <div className="bg-background rounded-lg border p-2.5 shadow-xs">
                <span className="text-muted-foreground block text-[11px]">{t("Shopee hoàn")}</span>
                <span className="text-foreground mt-0.5 block font-semibold">
                  {formatRate(shopeeRatePercent)}
                </span>
              </div>
              <div className="bg-background rounded-lg border p-2.5 shadow-xs">
                <span className="text-muted-foreground block text-[11px]">
                  {t("Hoa hồng bổ sung")}
                </span>
                <span className="text-foreground mt-0.5 block font-semibold">
                  {formatRate(sellerRatePercent)}
                </span>
              </div>
            </div>
            {estimatedUserCashbackVnd && (
              <div className="bg-primary/5 border-primary/20 mt-2 rounded-lg border p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-primary text-[11px] font-medium">
                    {t("Tiền hoàn ước tính bạn nhận")}
                  </span>
                  <span className="text-primary text-sm font-bold">
                    {formatAmount(estimatedUserCashbackVnd)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Danh sách giải thích chi tiết từng loại giá */}
        <div className="space-y-3.5 text-xs leading-5">
          {/* 1. Giá sản phẩm */}
          <div className="flex gap-3">
            <span className="text-primary bg-primary/10 grid size-7 shrink-0 place-items-center rounded-lg">
              <Tag className="size-4" />
            </span>
            <div>
              <h3 className="text-foreground text-sm font-semibold">
                {t("1. Giá sản phẩm (Giá niêm yết)")}
              </h3>
              <p className="text-muted-foreground mt-0.5">
                {t(
                  "Là giá bán hiển thị trên Shopee tại thời điểm tạo liên kết. Tiền hoàn thực tế có thể phụ thuộc vào ",
                )}
                <strong className="text-foreground font-medium">
                  {t("số tiền bạn thực thanh toán")}
                </strong>
                {t(
                  " sau khi áp dụng ưu đãi. Điều kiện tính tiền hoàn do chương trình và kết quả đối soát quyết định.",
                )}
              </p>
            </div>
          </div>

          {/* 2. Shopee hoàn */}
          <div className="flex gap-3">
            <span className="text-primary bg-primary/10 grid size-7 shrink-0 place-items-center rounded-lg">
              <Store className="size-4" />
            </span>
            <div>
              <h3 className="text-foreground text-sm font-semibold">{t("2. Shopee hoàn (%)")}</h3>
              <p className="text-muted-foreground mt-0.5">
                {t(
                  "Đây là tỷ lệ hoa hồng từ sàn khi có dữ liệu. Khoản tiền thực nhận còn tùy thuộc điều kiện đơn hàng, kết quả đối soát và chính sách chia đang áp dụng.",
                )}
              </p>
            </div>
          </div>

          {/* 3. Hoa hồng bổ sung */}
          <div className="flex gap-3">
            <span className="text-primary bg-primary/10 grid size-7 shrink-0 place-items-center rounded-lg">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h3 className="text-foreground text-sm font-semibold">
                {t("3. Hoa hồng bổ sung (%)")}
              </h3>
              <p className="text-muted-foreground mt-0.5">
                {t(
                  "Đây là phần hoa hồng bổ sung từ người bán khi có dữ liệu. Tỷ lệ có thể bằng 0 và khoản thực nhận còn phụ thuộc điều kiện của giao dịch.",
                )}
              </p>
            </div>
          </div>

          {/* 4. Tiền hoàn ước tính */}
          <div className="flex gap-3">
            <span className="text-primary bg-primary/10 grid size-7 shrink-0 place-items-center rounded-lg">
              <Coins className="size-4" />
            </span>
            <div>
              <h3 className="text-foreground text-sm font-semibold">
                {t("4. Tiền hoàn ước tính bạn có thể nhận")}
              </h3>
              <p className="text-muted-foreground mt-0.5">
                {t(
                  "Đây là số tiền tham khảo trước đối soát. Piggy Back chia hoa hồng theo tỷ lệ đang áp dụng; chỉ khoản đủ điều kiện và đã xác nhận mới được cộng vào ví.",
                )}
              </p>
            </div>
          </div>

          {/* 5. Thời gian đối soát */}
          <div className="flex gap-3">
            <span className="text-primary bg-primary/10 grid size-7 shrink-0 place-items-center rounded-lg">
              <Clock className="size-4" />
            </span>
            <div>
              <h3 className="text-foreground text-sm font-semibold">
                {t("5. Khi nào tiền hoàn vào Ví để rút?")}
              </h3>
              <p className="text-muted-foreground mt-0.5">
                {t(
                  "Bên thứ ba đối soát vào thứ Ba và thứ Năm. Piggy Back kiểm tra lại khoản hợp lệ trước khi cộng ví. Chỉ số dư khả dụng từ 10.000đ mới có thể yêu cầu rút; yêu cầu hợp lệ được xử lý trong 12–48 giờ, kể cả cuối tuần.",
                )}
              </p>
            </div>
          </div>

          {/* Mẹo nhận hoàn tiền */}
          <div className="bg-success-soft/60 border-success/30 rounded-xl border p-3">
            <div className="text-success flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{t("Lưu ý để giao dịch được xem xét ghi nhận")}</span>
            </div>
            <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-4 text-xs">
              <li>{t("Làm theo hướng dẫn về giỏ hàng trước khi mở liên kết mua sắm.")}</li>
              <li>
                {t("Mở liên kết do Piggy Back tạo và làm theo hướng dẫn đặt hàng.")}
              </li>
              <li>{t("Kiểm tra điều kiện ưu đãi trước khi mở một liên kết khác.")}</li>
            </ul>
          </div>
        </div>

        {/* Nút đóng */}
        <Button type="button" className="mt-2 w-full" onClick={() => onOpenChange(false)}>
          {t("Đã hiểu")}
        </Button>
      </div>
    </SurfaceDialog>
  );
}
