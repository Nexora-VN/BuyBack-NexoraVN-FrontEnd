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
                  Shopee Extra
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
                  {t("Shopee Extra hoàn")}
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
                  "Là giá bán hiển thị trên Shopee tại thời điểm tạo link. Lưu ý: Tiền hoàn thực tế sẽ được tính trên ",
                )}
                <strong className="text-foreground font-medium">
                  {t("số tiền bạn thực thanh toán")}
                </strong>
                {t(
                  " (sau khi đã áp voucher của Shop, voucher Shopee và trừ Shopee Xu, không tính phí vận chuyển).",
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
                  "Là tỷ lệ hoàn tiền cơ bản do sàn Shopee chi trả cố định theo từng ngành hàng. Mọi đơn hàng hợp lệ mua qua link tiếp thị của Piggy đều nhận được mức hoàn này.",
                )}
              </p>
            </div>
          </div>

          {/* 3. Shopee Extra hoàn */}
          <div className="flex gap-3">
            <span className="text-primary bg-primary/10 grid size-7 shrink-0 place-items-center rounded-lg">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h3 className="text-foreground text-sm font-semibold">
                {t("3. Shopee Extra hoàn (%)")}
              </h3>
              <p className="text-muted-foreground mt-0.5">
                {t(
                  "Là tỷ lệ hoàn tiền thưởng thêm do Người bán (Shop) tài trợ khi tham gia gói Shopee Extra. Sản phẩm có nhãn Extra sẽ có mức hoàn cao vượt trội. Nếu Shop không tham gia thì tỷ lệ này là 0%.",
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
                {t("4. Tiền hoàn ước tính (Cashback nhận về)")}
              </h3>
              <p className="text-muted-foreground mt-0.5">
                {t(
                  "Là số tiền thực tế dự kiến sẽ được cộng vào Ví Piggy của bạn. Piggy nhận hoa hồng từ Shopee và chia sẻ lại phần lớn cho bạn sau khi trừ một phần nhỏ chi phí vận hành.",
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
                  "Sau khi đặt hàng, đơn sẽ ở trạng thái “Chờ đối soát”. Khi đơn giao thành công và hoàn tất kỳ đối soát định kỳ của sàn (thường từ 15–30 ngày để đảm bảo không trả hàng), tiền sẽ vào Ví và bạn có thể rút về tài khoản ngân hàng.",
                )}
              </p>
            </div>
          </div>

          {/* Mẹo nhận hoàn tiền */}
          <div className="bg-success-soft/60 border-success/30 rounded-xl border p-3">
            <div className="text-success flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{t("Mẹo để nhận đủ 100% tiền hoàn")}</span>
            </div>
            <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-4 text-xs">
              <li>{t("Xóa sản phẩm khỏi giỏ hàng Shopee trước khi bấm link.")}</li>
              <li>
                {t("Nhấn “Mua ngay” từ Piggy, thêm lại sản phẩm vào giỏ và thanh toán ngay.")}
              </li>
              <li>{t("Không nhấn vào link khuyến mãi khác trước khi thanh toán.")}</li>
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
