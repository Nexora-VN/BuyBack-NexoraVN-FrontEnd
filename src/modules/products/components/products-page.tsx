"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Page } from "@/components/ui/page";
import { formatVnd } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import {
  useProductMutations,
  useProducts,
} from "@/modules/products/hooks/use-products";
import type { Product, ProductInput } from "@/modules/products/types/product";

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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductInput>(blank);
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);
  const products = useProducts({
    page,
    limit: 20,
    ...(query ? { search: query } : {}),
  });
  const mutations = useProductMutations();
  const show = (product?: Product) => {
    setEditing(product ?? null);
    setForm(
      product
        ? { ...product }
        : { ...blank, lastUpdate: new Date().toISOString() },
    );
    setOpen(true);
  };
  const save = async () => {
    try {
      if (editing)
        await mutations.update.mutateAsync({ id: editing.id, input: form });
      else await mutations.create.mutateAsync(form);
      toast.success("Đã lưu sản phẩm");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu sản phẩm",
      );
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await mutations.remove.mutateAsync(id);
      toast.success("Đã xóa sản phẩm");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa");
    }
  };
  return (
    <Page
      title="Quản lý sản phẩm"
      description="Dữ liệu sản phẩm Shopee và commission đã lưu trong hệ thống."
      actions={
        <Button onClick={() => show()}>
          <Plus />
          Thêm sản phẩm
        </Button>
      }
    >
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tên sản phẩm, shop hoặc URL"
          className="pl-10"
        />
      </div>
      {products.isLoading ? (
        <div className="h-64 rounded-2xl skeleton" />
      ) : products.isError ? (
        <div className="rounded-2xl bg-danger-soft p-5 text-danger">
          Không thể tải danh sách sản phẩm.
        </div>
      ) : (
        <>
          <DataTable
            rows={products.data?.data ?? []}
            rowKey={(row) => row.id}
            columns={[
              {
                key: "product",
                label: "Sản phẩm",
                render: (row) => (
                  <div className="flex min-w-72 items-center gap-3">
                    <div className="relative size-12 overflow-hidden rounded-xl bg-muted">
                      {row.imageUrl && (
                        <Image
                          src={row.imageUrl}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/admin/products/${row.id}`}
                        className="line-clamp-1 font-medium hover:text-primary"
                      >
                        {row.productName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {row.shopName}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "ids",
                label: "Shopee IDs",
                render: (row) => (
                  <div className="text-xs">
                    <p>Item: {row.itemId}</p>
                    <p>Shop: {row.shopId}</p>
                  </div>
                ),
              },
              {
                key: "price",
                label: "Giá",
                className: "text-right",
                render: (row) => (
                  <span className="font-semibold tabular">
                    {formatVnd(row.price)}
                  </span>
                ),
              },
              {
                key: "rate",
                label: "Tỷ lệ",
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
                      <Button variant="ghost" size="icon">
                        <ExternalLink />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
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
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{products.data?.meta.total ?? 0} sản phẩm</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= (products.data?.meta.totalPages ?? 1)}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </>
      )}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-white p-6 shadow-2xl">
            <div className="flex justify-between">
              <div>
                <Dialog.Title className="text-xl font-bold">
                  {editing ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  Nhập dữ liệu đúng theo Product API.
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-lg p-2 hover:bg-muted">
                <X />
              </Dialog.Close>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["itemId", "Item ID", "text"],
                  ["shopId", "Shop ID", "text"],
                  ["productName", "Tên sản phẩm", "text"],
                  ["shopName", "Tên shop", "text"],
                  ["originLink", "Origin link", "url"],
                  ["productLink", "Product link", "url"],
                  ["imageUrl", "Image URL", "url"],
                  ["rating", "Rating", "text"],
                  ["price", "Giá", "number"],
                  ["sales", "Lượt bán", "number"],
                  ["commission", "Commission", "number"],
                  ["sellerComFinal", "Seller commission", "number"],
                  ["shoppeComFinal", "Shopee commission", "number"],
                  ["sellerRate", "Seller rate", "number"],
                  ["shopeeRate", "Shopee rate", "number"],
                  ["sellerRatePercent", "Seller %", "number"],
                  ["shopeeRatePercent", "Shopee %", "number"],
                  ["totalRatePercent", "Tổng %", "number"],
                  ["cap", "Cap", "text"],
                  ["capRow", "Cap raw", "text"],
                  ["capAfterRate", "Cap sau rate", "text"],
                ] as const
              ).map(([key, label, type]) => (
                <label
                  key={key}
                  className={
                    [
                      "productName",
                      "originLink",
                      "productLink",
                      "imageUrl",
                    ].includes(key)
                      ? "sm:col-span-2"
                      : ""
                  }
                >
                  <span className="mb-1 block text-xs font-semibold">
                    {label}
                  </span>
                  <Input
                    type={type}
                    step="any"
                    value={String(form[key])}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]:
                          type === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                      })
                    }
                  />
                </label>
              ))}
              <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["hasSellerCommission", "Có seller commission"],
                    ["hasShopeeCommission", "Có Shopee commission"],
                    ["isExtra", "Xtra"],
                    ["isCapped", "Đã cap"],
                    ["isLimitCap", "Giới hạn cap"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.checked })
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">Hủy</Button>
              </Dialog.Close>
              <Button onClick={save}>Lưu sản phẩm</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Page>
  );
}
