"use client";
import { ProductThumbnail } from "@/components/patterns/product-thumbnail";
import { ResourceToolbar } from "@/components/patterns/resource-toolbar";

import { ListPagination } from "@/components/patterns/list-controls";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Page } from "@/components/ui/page";
import { Link } from "@/i18n/navigation";
import { formatVnd } from "@/lib/format";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";

import dynamic from "next/dynamic";
import { useProductsPage } from "../hooks/use-products-page";
const ProductFormDialog = dynamic(() =>
  import("./product-form-dialog").then((module) => module.ProductFormDialog),
);
export function ProductsPage() {
  const state = useProductsPage();
  const { t, list, page, open, form, products, show, remove } = state;
  return (
    <Page
      title={t("Quản lý sản phẩm")}
      description="Dữ liệu sản phẩm Shopee và commission đã lưu trong hệ thống."
      actions={
        <Button onClick={() => show()}>
          <Plus />
          {t("Thêm sản phẩm")}
        </Button>
      }
    >
      <ResourceToolbar scope="products" label="Tìm tên sản phẩm, shop hoặc URL" />
      {products.isLoading ? (
        <div className="skeleton h-64 rounded-2xl" />
      ) : products.isError ? (
        <div className="bg-danger-soft text-danger rounded-2xl p-5">
          {t("Không thể tải danh sách sản phẩm.")}
        </div>
      ) : (
        <>
          <DataTable
            rows={products.data?.data ?? []}
            rowKey={(row) => row.id}
            columns={[
              {
                key: "product",
                label: t("Sản phẩm"),
                render: (row) => (
                  <div className="flex min-w-0 items-center gap-3 lg:min-w-64">
                    <ProductThumbnail src={row.imageUrl} name={row.productName} />
                    <div className="min-w-0">
                      <Link
                        href={`/admin/products/${row.id}`}
                        className="hover:text-primary line-clamp-1 font-medium"
                      >
                        {row.productName}
                      </Link>
                      <p className="text-muted-foreground text-xs">{row.shopName}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "ids",
                label: "Shopee IDs",
                render: (row) => (
                  <div className="text-xs">
                    <p>
                      {t("Item:")}
                      {row.itemId}
                    </p>
                    <p>
                      {t("Shop:")}
                      {row.shopId}
                    </p>
                  </div>
                ),
              },
              {
                key: "price",
                label: t("Giá"),
                className: "text-right",
                render: (row) => (
                  <span className="tabular font-semibold">{formatVnd(row.price)}</span>
                ),
              },
              {
                key: "rate",
                label: t("Tỷ lệ"),
                className: "text-right",
                render: (row) => `${row.totalRatePercent}%`,
              },
              {
                key: "commission",
                label: "Commission",
                className: "text-right",
                render: (row) => formatVnd(row.commission),
              },
              {
                key: "actions",
                label: "",
                className: "text-right",
                render: (row) => (
                  <div className="flex justify-end">
                    <a href={row.productLink} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" aria-label={t("Mở sản phẩm")}>
                        <ExternalLink />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("Sửa")}
                      onClick={() => show(row)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-danger"
                      onClick={() => remove(row.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
          <ListPagination
            page={page}
            total={products.data?.meta.total ?? 0}
            totalPages={products.data?.meta.totalPages ?? 1}
            pending={products.isFetching}
            onPage={(page) => list.update({ page })}
          />
        </>
      )}
      {state.open && <ProductFormDialog state={state} />}
    </Page>
  );
}
