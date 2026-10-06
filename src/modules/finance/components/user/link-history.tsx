"use client";
import { useCopy } from "@/i18n/use-copy";

import { Button } from "@/components/ui/button";
import { ProductThumbnail } from "@/components/patterns/product-thumbnail";
import { Page } from "@/components/ui/page";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { FinanceTable, read, text } from ".././finance-ui";

export function LinkHistoryPage() {
  const t = useCopy();

  return (
    <Page
      title={t("Link của tôi")}
      actions={
        <Button asChild>
          <Link href="/app/links/new">{t("Tạo link mới")}</Link>
        </Button>
      }
    >
      <FinanceTable
        path="me/affiliate-links"
        searchLabel="Tìm URL gốc"
        extraColumns={[
          {
            key: "product",
            label: t("Sản phẩm"),
            mobilePrimary: true,
            render: (row) => {
              const name = text(row, "product.productName");
              const productName = name === "—" ? t("Sản phẩm Shopee") : name;
              const imageUrl = read(row, "product.imageUrl");
              return (
                <div className="flex min-w-0 items-start gap-3">
                  <ProductThumbnail
                    src={typeof imageUrl === "string" ? imageUrl : null}
                    name={productName}
                    className="size-16 shrink-0 lg:size-14"
                  />
                  <p className="min-w-0 flex-1 leading-snug font-semibold break-words">
                    {productName}
                  </p>
                </div>
              );
            },
          },
        ]}
        specs={[
          ["affiliateLinkStatus", t("Trạng thái"), "status"],
          ["createdAt", t("Ngày tạo"), "date"],
        ]}
        actions={(row) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void navigator.clipboard
                .writeText(text(row, "fullLinkSystem"))
                .then(() => toast.success(t("Đã sao chép")))
                .catch(() => toast.error(t.error("Không thể sao chép")))
            }
          >
            {t("Sao chép link")}
          </Button>
        )}
      />
    </Page>
  );
}
