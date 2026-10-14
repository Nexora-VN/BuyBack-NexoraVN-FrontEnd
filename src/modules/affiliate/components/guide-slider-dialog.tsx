"use client";

import { SurfaceDialog } from "@/components/patterns/surface-dialog";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/i18n/use-copy";
import { CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Lightbulb } from "lucide-react";
import { useCallback, useState, type TouchEvent } from "react";

export interface GuideSlide {
  step: string;
  label: string;
  title: string;
  image: string;
  alt: string;
  description: string;
  tips: string[];
}

export const GUIDE_SLIDES: GuideSlide[] = [
  {
    step: "1",
    label: "Bước 1 - 2",
    title: "Xóa giỏ hàng & Sao chép liên kết Shopee",
    image: "/guide/1.png",
    alt: "Hướng dẫn xóa giỏ hàng Shopee và sao chép đường dẫn sản phẩm",
    description:
      "Vào giỏ hàng Shopee xóa sản phẩm cần mua. Sau đó vào lại trang sản phẩm Shopee, nhấn biểu tượng Chia sẻ (mũi tên cong góc trên bên phải) và chọn “Sao chép đường dẫn”.",
    tips: [
      "Bắt buộc xóa sản phẩm khỏi giỏ Shopee trước khi lấy liên kết để hệ thống ghi nhận hoa hồng.",
      "Sao chép đường dẫn trực tiếp từ trang chi tiết sản phẩm.",
    ],
  },
  {
    step: "2",
    label: "Bước 3 - 4",
    title: "Dán liên kết vào Piggy Back & Bấm “Mua ngay”",
    image: "/guide/2.png",
    alt: "Hướng dẫn dán liên kết vào Piggy Back và tạo liên kết mua sắm hoàn tiền",
    description:
      "Mở Piggy Back, dán liên kết vừa sao chép vào ô dán liên kết rồi bấm “Tạo liên kết hoàn tiền”. Xem tiền hoàn ước tính rồi bấm “Mua ngay” để bắt đầu mua sắm.",
    tips: [
      "Piggy Back hiển thị khoản hoàn dự kiến từ sàn và người bán khi có dữ liệu.",
      "Bấm “Mua ngay” để được chuyển sang Shopee với mã theo dõi hoàn tiền hợp lệ.",
    ],
  },
  {
    step: "3",
    label: "Bước 5 - 6",
    title: "Chuyển sang Shopee & Đặt hàng",
    image: "/guide/3.png",
    alt: "Hướng dẫn chuyển sang Shopee, áp dụng mã giảm giá và thanh toán",
    description:
      "Piggy Back chuyển bạn sang Shopee. Bấm “Mua ngay” hoặc thêm lại sản phẩm vào giỏ, áp dụng mã giảm giá phù hợp và bấm “Đặt hàng”.",
    tips: [
      "Bạn vẫn áp dụng mã giảm giá của cửa hàng, mã giảm giá Shopee và Shopee Xu bình thường.",
      "Đặt hàng trong phiên mở liên kết và làm theo hướng dẫn ghi nhận. Kết quả còn phụ thuộc điều kiện của Shopee và đối soát.",
    ],
  },
  {
    step: "4",
    label: "Tổng kết",
    title: "Quy trình trọn gói & Lưu ý quan trọng",
    image: "/guide/4.png",
    alt: "Tổng hợp 4 bước nhận hoàn tiền qua Piggy Back",
    description:
      "Tóm tắt 4 bước mua sắm hoàn tiền trên Piggy Back. Kiểm tra điều kiện ưu đãi và ghi nhận trước khi đặt hàng.",
    tips: [
      "Luôn xóa sản phẩm khỏi giỏ trước khi tạo liên kết trên Piggy Back.",
      "Tiền hoàn sẽ vào Ví sau khi đơn giao thành công và hoàn tất đối soát.",
    ],
  },
];

interface GuideSliderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartAction?: () => void;
}

export function GuideSliderDialog({ open, onOpenChange, onStartAction }: GuideSliderDialogProps) {
  const t = useCopy();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setCurrentIndex(0);
    }
    onOpenChange(next);
  };

  const total = GUIDE_SLIDES.length;
  const slide = GUIDE_SLIDES[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : prev));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleFinish = () => {
    handleOpenChange(false);
    onStartAction?.();
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.changedTouches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? 0;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    setTouchStartX(null);
  };

  return (
    <SurfaceDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t("Hướng dẫn lấy liên kết và mua sắm hoàn tiền")}
    >
      <div
        className="flex flex-col gap-4 focus:outline-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Step Navigation Pills */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {GUIDE_SLIDES.map((item, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl p-2 text-center transition-all ${
                  isActive
                    ? "bg-primary font-semibold text-white shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                }`}
                aria-label={`Chuyển đến ${item.label}`}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="text-[11px] leading-none sm:text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Slide Title and Description */}
        <div className="bg-muted/30 rounded-xl border p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold">
              {currentIndex + 1}
            </span>
            <h3 className="text-foreground text-sm font-bold sm:text-base">{t(slide.title)}</h3>
          </div>
          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed sm:text-sm">
            {t(slide.description)}
          </p>

          {/* Quick tips list */}
          <div className="mt-2.5 space-y-1">
            {slide.tips.map((tip, idx) => (
              <div
                key={idx}
                className="text-muted-foreground flex items-start gap-1.5 text-[11px] sm:text-xs"
              >
                <CheckCircle2 className="text-success mt-0.5 size-3.5 shrink-0" />
                <span>{t(tip)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Image View */}
        <div className="bg-muted/20 relative overflow-hidden rounded-2xl border p-2 text-center sm:p-3">
          <div className="flex max-h-[46vh] min-h-[220px] items-center justify-center sm:max-h-[50vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.alt}
              className="max-h-[44vh] w-auto max-w-full rounded-xl object-contain shadow-xs transition-opacity duration-200 sm:max-h-[48vh]"
            />
          </div>

          {/* Quick open in new tab hint */}
          <a
            href={slide.image}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary mt-2 inline-flex items-center gap-1 text-[11px] transition-colors"
          >
            <span>{t("Xem ảnh gốc kích thước lớn")}</span>
            <ExternalLink className="size-3" />
          </a>
        </div>

        {/* Bottom Navigation Controls */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="min-w-24 gap-1"
          >
            <ChevronLeft className="size-4" />
            <span>{t("Trước")}</span>
          </Button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {GUIDE_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`size-2 cursor-pointer rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-primary w-5"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Chuyển đến trang ${idx + 1}`}
              />
            ))}
          </div>

          {currentIndex < total - 1 ? (
            <Button type="button" size="sm" onClick={goNext} className="min-w-24 gap-1">
              <span>{t("Tiếp theo")}</span>
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={handleFinish} className="min-w-28 gap-1">
              <Lightbulb className="size-4" />
              <span>{t("Đã hiểu, tạo liên kết")}</span>
            </Button>
          )}
        </div>
      </div>
    </SurfaceDialog>
  );
}
