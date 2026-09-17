"use client";
import { ResourceToolbar } from "@/components/patterns/resource-toolbar";
import { ProductThumbnail } from "@/components/patterns/product-thumbnail";

import { useCopy } from "@/i18n/use-copy";

import { useConfirm } from "@/components/patterns/confirm-provider";
import { ListPagination } from "@/components/patterns/list-controls";
import { SurfaceDialog } from "@/components/patterns/surface-dialog";
import { useListState } from "@/lib/use-list-state";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Page } from "@/components/ui/page";
import { Link } from "@/i18n/navigation";
import { formatVnd } from "@/lib/format";
import { useProductMutations, useProducts } from "@/modules/products/hooks/use-products";
import type { Product, ProductInput } from "@/modules/products/types/product";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const blank: ProductInput = {
  itemId: "",
  shopId: "",
  productName: "",
  shopName: "",
  originLink: "",
  price: 0,
  sales: 0,
  imageUrl: "",
  productLink: "",
  rating: "0",
  hasSellerCommission: false,
  hasShopeeCommission: false,
  commission: 0,
  sellerComFinal: 0,
  shoppeComFinal: 0,
  sellerRate: 0,
  shopeeRate: 0,
  sellerRatePercent: 0,
  shopeeRatePercent: 0,
  totalRatePercent: 0,
  isExtra: false,
  isCapped: false,
  isLimitCap: false,
  cap: "0",
  capRow: "0",
  capAfterRate: "0",
  lastUpdate: new Date().toISOString(),
};
export function ProductsPage() {
  const t = useCopy();

  const confirm = useConfirm();
  const list = useListState("products");
  const page = list.page,
    query = list.query;
  const saveLock = useRef(false);
  const [saveError, setSaveError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductInput>(blank);

  const products = useProducts({
    page,
    limit: 20,
    sort: list.sort,
    ...(query ? { search: query } : {}),
  });
  const mutations = useProductMutations();
  const show = (product?: Product) => {
    setEditing(product ?? null);
    setForm(
      product
        ? {
            ...product,
            price: Number(product.price),
            commission: Number(product.commission),
            sellerComFinal: Number(product.sellerComFinal),
            shoppeComFinal: Number(product.shoppeComFinal),
          }
        : { ...blank, lastUpdate: new Date().toISOString() },
    );
    setSaveError("");
    setOpen(true);
  };
  const save = async () => {
    try {
      if (editing) await mutations.update.mutateAsync({ id: editing.id, input: form });
      else await mutations.create.mutateAsync(form);
      toast.success(t("Đã lưu sản phẩm"));
      setOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : t("Không thể lưu"));
    } finally {
      saveLock.current = false;
    }
  };
  const remove = async (id: string) => {
    if (mutations.remove.isPending) return;
    if (!(await confirm(t("Xóa sản phẩm này?")))) return;
    try {
      await mutations.remove.mutateAsync(id);
      toast.success(t("Đã xóa sản phẩm"));
    } catch (error) {
      toast.error(t.error(error instanceof Error ? error.message : t("Không thể xóa")));
    }
  };
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
      <SurfaceDialog
        busy={mutations.create.isPending || mutations.update.isPending}
        open={open}
        onOpenChange={setOpen}
        title={editing ? t("Cập nhật sản phẩm") : t("Thêm sản phẩm")}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["itemId", "Item ID", "text"],
                ["shopId", "Shop ID", "text"],
                ["productName", t("Tên sản phẩm"), "text"],
                ["shopName", t("Tên shop"), "text"],
                ["originLink", "Origin link", "url"],
                ["productLink", "Product link", "url"],
                ["imageUrl", "Image URL", "url"],
                ["rating", "Rating", "text"],
                ["price", t("Giá"), "number"],
                ["sales", t("Lượt bán"), "number"],
                ["commission", "Commission", "number"],
                ["sellerComFinal", "Seller commission", "number"],
                ["shoppeComFinal", "Shopee commission", "number"],
                ["sellerRate", "Seller rate", "number"],
                ["shopeeRate", "Shopee rate", "number"],
                ["sellerRatePercent", "Seller %", "number"],
                ["shopeeRatePercent", "Shopee %", "number"],
                ["totalRatePercent", t("Tổng %"), "number"],
                ["cap", "Cap", "text"],
                ["capRow", "Cap raw", "text"],
                ["capAfterRate", "Cap sau rate", "text"],
              ] as const
            ).map(([key, label, type]) => (
              <label
                key={key}
                className={
                  ["productName", "originLink", "productLink", "imageUrl"].includes(key)
                    ? "sm:col-span-2"
                    : ""
                }
              >
                <span className="mb-1 block text-xs font-semibold">{t(label)}</span>
                <Input
                  type={type}
                  step="any"
                  value={String(form[key])}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]: type === "number" ? Number(e.target.value) : e.target.value,
                    })
                  }
                />
              </label>
            ))}
            <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
              {(
                [
                  ["hasSellerCommission", t("Có seller commission")],
                  ["hasShopeeCommission", t("Có Shopee commission")],
                  ["isExtra", "Xtra"],
                  ["isCapped", t("Đã cap")],
                  ["isLimitCap", t("Giới hạn cap")],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  />
                  {t(label)}
                </label>
              ))}
            </div>
          </div>
          {saveError && (
            <p role="alert" className="text-danger mt-4">
              {t.error(saveError)}
            </p>
          )}
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              disabled={mutations.create.isPending || mutations.update.isPending}
              onClick={() => setOpen(false)}
            >
              {t("Hủy")}
            </Button>
            <Button
              type="submit"
              disabled={mutations.create.isPending || mutations.update.isPending}
            >
              {t("Lưu sản phẩm")}
            </Button>
          </div>
        </form>
      </SurfaceDialog>
    </Page>
  );
}
