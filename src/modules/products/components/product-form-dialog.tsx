"use client";

import { ApiErrorNotice } from "@/components/errors/api-error-notice";
import { SurfaceDialog } from "@/components/patterns/surface-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ProductsPageState } from "../hooks/use-products-page";
export function ProductFormDialog({ state }: { state: ProductsPageState }) {
  const { t, page, saveError, open, setOpen, editing, form, setForm, products, mutations, save } =
    state;
  return (
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
        {Boolean(saveError) && (
          <div className="mt-4">
            <ApiErrorNotice error={saveError} />
          </div>
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
          <Button type="submit" disabled={mutations.create.isPending || mutations.update.isPending}>
            {t("Lưu sản phẩm")}
          </Button>
        </div>
      </form>
    </SurfaceDialog>
  );
}
