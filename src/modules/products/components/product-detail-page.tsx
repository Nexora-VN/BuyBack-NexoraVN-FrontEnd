"use client";
import { useCopy } from "@/i18n/use-copy";

import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { formatDateTime, formatVnd } from "@/lib/format";
import { useProduct } from "@/modules/products/hooks/use-products";
import { ExternalLink, PackageCheck, Percent, ShoppingBag, Star } from "lucide-react";
import { ProductThumbnail } from "@/components/patterns/product-thumbnail";

export function ProductDetailPage({ id }: { id: string }) {
  const t = useCopy();
  const query = useProduct(id);
  if (query.isLoading)
    return (
      <Page title={t("Chi tiết sản phẩm")}>
        <div className="skeleton h-72 rounded-2xl" />
      </Page>
    );
  if (!query.data)
    return (
      <Page title={t("Không tìm thấy sản phẩm")}>
        <p className="text-danger">{t("Không thể tải sản phẩm.")}</p>
      </Page>
    );
  const product = query.data;
  return (
    <Page
      title={t("Chi tiết sản phẩm")}
      description={`Shopee item ${product.itemId} · shop ${product.shopId}`}
      actions={
        <Button asChild variant="outline">
          <a href={product.productLink} target="_blank" rel="noreferrer">
            <ExternalLink />
            {t("Mở trên Shopee")}
          </a>
        </Button>
      }
    >
      <Card>
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <ProductThumbnail
            src={product.imageUrl}
            name={product.productName}
            className="aspect-square w-full"
          />
          <div>
            <p className="text-primary text-sm font-medium">{product.shopName}</p>
            <h2 className="mt-2 text-xl leading-8 font-bold sm:text-2xl">{product.productName}</h2>
            <p className="text-primary tabular mt-4 text-3xl font-bold">
              {formatVnd(product.price)}
            </p>
            <p className="text-muted-foreground mt-3 text-sm">
              {t("Cập nhật")}
              {formatDateTime(product.lastUpdate)}
            </p>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Đã bán"
          value={product.sales.toLocaleString("vi-VN")}
          icon={<ShoppingBag />}
        />
        <StatCard label="Đánh giá" value={product.rating} icon={<Star />} />
        <StatCard label="Tổng tỷ lệ" value={`${product.totalRatePercent}%`} icon={<Percent />} />
        <StatCard
          label="Commission"
          value={formatVnd(product.commission)}
          icon={<PackageCheck />}
        />
      </div>
      <Card>
        <h2 className="text-lg font-semibold">{t("Chi tiết commission")}</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground text-sm">{t("Seller")}</dt>
            <dd className="mt-1 font-semibold">
              {formatVnd(product.sellerComFinal)} · {product.sellerRatePercent}%
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Shopee</dt>
            <dd className="mt-1 font-semibold">
              {formatVnd(product.shoppeComFinal)} · {product.shopeeRatePercent}%
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">{t("Cap")}</dt>
            <dd className="mt-1 font-semibold">{formatVnd(product.capAfterRate)}</dd>
          </div>
        </dl>
      </Card>
    </Page>
  );
}
