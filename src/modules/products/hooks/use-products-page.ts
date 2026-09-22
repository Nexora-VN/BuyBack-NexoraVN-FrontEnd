"use client";

import { useCopy } from "@/i18n/use-copy";

import { useConfirm } from "@/components/patterns/confirm-provider";
import { useListState } from "@/lib/use-list-state";

import { useProductMutations, useProducts } from "@/modules/products/hooks/use-products";
import type { Product, ProductInput } from "@/modules/products/types/product";
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
export function useProductsPage() {
  const t = useCopy();

  const confirm = useConfirm();
  const list = useListState("products");
  const page = list.page,
    query = list.query;
  const saveLock = useRef(false);
  const [saveError, setSaveError] = useState<unknown>(null);
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
    setSaveError(null);
    setOpen(true);
  };
  const save = async () => {
    try {
      if (editing) await mutations.update.mutateAsync({ id: editing.id, input: form });
      else await mutations.create.mutateAsync(form);
      toast.success(t("Đã lưu sản phẩm"));
      setOpen(false);
    } catch (error) {
      setSaveError(error);
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
  return {
    t,
    confirm,
    list,
    page,
    query,
    saveLock,
    saveError,
    setSaveError,
    open,
    setOpen,
    editing,
    setEditing,
    form,
    setForm,
    products,
    mutations,
    show,
    save,
    remove,
  };
}
export type ProductsPageState = ReturnType<typeof useProductsPage>;
