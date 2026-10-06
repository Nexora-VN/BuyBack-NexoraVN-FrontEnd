"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Link2,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { ProductThumbnail } from "@/components/patterns/product-thumbnail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { Link } from "@/i18n/navigation";
import { useCopy } from "@/i18n/use-copy";
import { formatDateTime, formatVnd } from "@/lib/format";
import { affiliateService } from "@/modules/affiliate/services/affiliate.service";
import { productsService } from "../services/products.service";

export function CustomerProductPage({ itemId, backHref }: { itemId: string; backHref: string }) {
  const t = useCopy();
  const query = useQuery({
    queryKey: ["catalog-product", itemId],
    queryFn: () => productsService.catalogDetail(itemId),
    staleTime: 60_000,
    retry: false,
  });
  const [purchase, setPurchase] = useState<{ link: string; cashback: string | null } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const product = query.data;
  const back = (
    <Button asChild variant="ghost">
      <Link href={backHref}>
        <ArrowLeft />
        {t("Quay lại đơn hàng")}
      </Link>
    </Button>
  );

  if (query.isLoading)
    return (
      <Page title={t("Chi tiết sản phẩm")} actions={back}>
        <div
          className="grid gap-6 lg:grid-cols-2"
          aria-busy="true"
          aria-label={t("Đang tải sản phẩm")}
        >
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-5">
            <div className="skeleton h-12 rounded-xl" />
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-52 rounded-xl" />
          </div>
        </div>
      </Page>
    );
  if (!product)
    return (
      <Page title={t("Chi tiết sản phẩm")} actions={back}>
        <Card className="space-y-4 py-10 text-center">
          <ShoppingBag className="text-primary mx-auto size-10" />
          <h2 className="text-lg font-semibold">{t("Chưa tải được thông tin sản phẩm")}</h2>
          <p className="text-muted-foreground mx-auto max-w-md text-sm leading-6">
            {t(
              "Sản phẩm có thể đã ngừng bán hoặc thông tin đang tạm thời không khả dụng. Bạn có thể thử lại sau.",
            )}
          </p>
          <Button
            variant="outline"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            <RefreshCw className={query.isFetching ? "animate-spin" : ""} />
            {t("Thử lại")}
          </Button>
        </Card>
      </Page>
    );

  const createPurchaseLink = async () => {
    setGenerating(true);
    setPurchaseError("");
    try {
      const result = await affiliateService.generate(product.productUrl);
      if (!result.link) throw new Error(t("Chưa tạo được link hoàn tiền. Vui lòng thử lại."));
      setPurchase({ link: result.link, cashback: result.estimatedUserCashbackVnd ?? null });
    } catch (error) {
      setPurchaseError(error instanceof Error ? error.message : t("Không thể tạo link hoàn tiền"));
    } finally {
      setGenerating(false);
    }
  };
  const copyPurchaseLink = async () => {
    try {
      await navigator.clipboard.writeText(purchase!.link);
      toast.success(t("Đã sao chép link"));
    } catch {
      toast.error(t("Không thể sao chép. Hãy mở link mua hàng và sao chép trên trình duyệt."));
    }
  };
  const cashback = purchase ? purchase.cashback : product.estimatedUserCashbackVnd;
  const stats = product.priceStats;
  const min = Number(stats?.minPrice ?? 0);
  const max = Number(stats?.maxPrice ?? 0);
  const position =
    max > min
      ? Math.max(0, Math.min(100, ((Number(product.price) - min) / (max - min)) * 100))
      : 50;

  return (
    <Page title={t("Chi tiết sản phẩm")} actions={back}>
      {product.dataStatus === "saved" && (
        <p role="status" className="bg-warning-soft text-warning rounded-xl border p-3 text-sm">
          {t(
            "Đang hiển thị thông tin đã lưu. Giá và tiền hoàn mới nhất sẽ được kiểm tra khi tạo link mua hàng.",
          )}
        </p>
      )}
      <Card className="overflow-hidden !p-0">
        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="bg-white p-5 sm:p-8">
            <ProductThumbnail
              src={product.imageUrl}
              name={product.productName}
              className="aspect-square w-full !rounded-2xl"
            />
          </div>
          <div className="flex flex-col gap-5 border-t p-5 sm:p-8 lg:border-t-0 lg:border-l">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
                Shopee
              </span>
              {product.isExtra && (
                <span className="bg-secondary text-primary rounded-md px-2 py-1 text-xs font-semibold">
                  Shopee Xtra
                </span>
              )}
            </div>
            <div>
              <p className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                <Store className="size-4 shrink-0" />
                {product.shopName}
              </p>
              <h2 className="text-xl leading-8 font-bold sm:text-2xl">{product.productName}</h2>
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <strong className="text-foreground">{product.rating}</strong> / 5
              </span>
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="size-4" />
                {new Intl.NumberFormat("vi-VN").format(product.sales)} {t("đã bán")}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{t("Giá tham khảo hiện tại")}</p>
              <p className="text-primary mt-1 text-3xl font-extrabold tabular-nums sm:text-4xl">
                {formatVnd(product.price)}
              </p>
              <p className="text-muted-foreground mt-2 text-xs leading-5">
                {t("Giá cuối cùng và phân loại sản phẩm được xác nhận khi thanh toán trên Shopee.")}
              </p>
            </div>
            <div className="border-primary/15 bg-secondary/60 rounded-2xl border p-4">
              <div className="text-primary flex items-center gap-2 text-sm font-semibold">
                <Wallet className="size-5" />
                {t("Hoàn tiền dự kiến")}
              </div>
              <p className="text-primary mt-2 text-2xl font-extrabold">
                {cashback !== null ? `+${formatVnd(cashback)}` : t("Chưa có ước tính")}
              </p>
              <p className="text-muted-foreground mt-2 text-xs leading-5">
                {t(
                  "Tiền hoàn thực tế phụ thuộc giá trị đơn, điều kiện ưu đãi và kết quả đối soát. Hãy mua qua link Piggy Back để được ghi nhận.",
                )}
              </p>
            </div>
            <div className="space-y-3" aria-live="polite">
              {purchase ? (
                <>
                  <p className="text-success flex items-center gap-2 text-sm font-semibold">
                    <Check className="size-4" />
                    {t("Link hoàn tiền đã sẵn sàng")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="lg" className="flex-1">
                      <a href={purchase.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink />
                        {t("Mua trên Shopee")}
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => void copyPurchaseLink()}
                      aria-label={t("Sao chép link hoàn tiền")}
                    >
                      <Copy />
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  disabled={generating}
                  onClick={() => void createPurchaseLink()}
                >
                  {generating ? <LoaderCircle className="animate-spin" /> : <Link2 />}
                  {generating ? t("Đang tạo link…") : t("Tạo link mua hoàn tiền")}
                </Button>
              )}
              {purchaseError && (
                <p role="alert" className="text-danger text-sm">
                  {purchaseError}
                </p>
              )}
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary flex min-h-11 items-center justify-center gap-2 text-sm underline"
              >
                {t("Xem sản phẩm trên Shopee")}
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </Card>

      {stats && (
        <Card className="space-y-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary size-5" />
            <h2 className="text-lg font-bold">{t("Thống kê giá sản phẩm")}</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            {t("So sánh giá hiện tại với khoảng giá đã ghi nhận.")}
          </p>
          <div className="px-2 pt-2">
            <div className="bg-muted relative h-3 rounded-full">
              <div
                className="bg-primary/25 absolute h-3 rounded-full"
                style={{ width: `${position}%` }}
              />
              <span
                className="border-primary bg-card absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
                style={{ left: `${position}%` }}
                aria-label={t("Giá hiện tại")}
              />
            </div>
            <div className="text-muted-foreground mt-3 flex justify-between gap-2 text-xs">
              <span>{formatVnd(stats.minPrice)}</span>
              <span>{formatVnd(stats.maxPrice)}</span>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-3">
            {[
              [t("Thấp nhất"), stats.minPrice],
              [t("Trung bình"), stats.avgPrice],
              [t("Cao nhất"), stats.maxPrice],
            ].map(([label, value]) => (
              <div key={label} className="bg-background rounded-xl border p-3">
                <dt className="text-muted-foreground text-xs">{label}</dt>
                <dd className="mt-2 text-sm font-bold sm:text-lg">{formatVnd(value!)}</dd>
              </div>
            ))}
          </dl>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [t("Thay đổi 7 ngày"), stats.priceChange7d],
              [t("Thay đổi 30 ngày"), stats.priceChange30d],
            ].map(([label, amount]) => {
              const value = BigInt(amount!);
              return (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span
                    className={`flex items-center gap-1 font-semibold ${value < 0n ? "text-success" : value > 0n ? "text-warning" : "text-foreground"}`}
                  >
                    {value < 0n ? (
                      <ArrowDownRight className="size-4" />
                    ) : value > 0n ? (
                      <ArrowUpRight className="size-4" />
                    ) : null}
                    {value > 0n ? "+" : ""}
                    {formatVnd(amount!)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-xs">
        <p>
          {t("Mã sản phẩm")}: {product.itemId} · {t("Cập nhật")}:{" "}
          {formatDateTime(product.lastUpdate)}
        </p>
        <p className="flex items-center gap-1.5">
          <ShieldCheck className="size-4" />
          {t("Thông tin tham khảo, không thay đổi giá trị đơn hàng đã mua.")}
        </p>
      </div>
    </Page>
  );
}
