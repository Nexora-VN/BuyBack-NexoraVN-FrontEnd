"use client";
import { useCopy } from "@/i18n/use-copy";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Page } from "@/components/ui/page";
import { affiliateService } from "@/modules/affiliate/services/affiliate.service";
import type { GenerateAffiliateResponse } from "@/modules/affiliate/types/affiliate";
import { useRefreshFinance } from "@/modules/finance/hooks/use-finance";
import {
  Check,
  Copy,
  ExternalLink,
  ImageOff,
  Link2,
  LoaderCircle,
  ShoppingCart,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const shopeeHosts = ["shopee.vn", "s.shopee.vn", "vn.shp.ee", "shp.ee"];
const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});
function formatAmount(value: string | null | undefined) {
  return value != null && /^\d+$/.test(value) ? money.format(BigInt(value)) : null;
}

export function GenerateLinkPanel() {
  const t = useCopy();

  const [formError, setFormError] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<GenerateAffiliateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const revision = useRef(0);
  const pending = useRef(false);
  const refresh = useRefreshFinance();

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setResult(null);
    setFormError("");
    const input = url.trim();
    try {
      const parsed = new URL(input);
      if (
        !shopeeHosts.includes(parsed.hostname) ||
        !["https:", "http:"].includes(parsed.protocol)
      ) {
        toast.error(t.error("Chỉ hỗ trợ link Shopee hợp lệ"));
        return;
      }
    } catch {
      toast.error(t.error("Link không hợp lệ"));
      return;
    }
    const requestRevision = revision.current;
    pending.current = true;
    setLoading(true);
    try {
      const response = await affiliateService.generate(input);
      // Ignore a response if the user has edited the product URL while it was loading.
      if (requestRevision !== revision.current) return;
      if (!response.link) throw new Error(t("Không tạo được link. Vui lòng thử lại."));
      setImageFailed(false);
      setResult(response);
      void refresh();
      toast.success(t("Tạo link cashback thành công"));
    } catch (error) {
      if (requestRevision === revision.current) {
        toast.error(t.error(error instanceof Error ? error.message : t("Tạo link thất bại")));
      }
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }

  async function copy() {
    if (!result?.link) return;
    try {
      await navigator.clipboard.writeText(result.link);
      toast.success(t("Đã sao chép link chia sẻ"));
    } catch {
      toast.error(t.error("Không thể sao chép link. Vui lòng thử lại."));
    }
  }

  const product = result?.product;
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <Card className="min-w-0">
        <div className="bg-secondary text-primary mb-5 flex size-12 items-center justify-center rounded-2xl">
          <Link2 />
        </div>
        <form onSubmit={generate}>
          <label htmlFor="shopee-url" className="text-sm font-semibold">
            {t("Link sản phẩm Shopee, TikTok")}
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Input
              id="shopee-url"
              aria-invalid={!!formError}
              aria-describedby="shopee-url-error"
              value={url}
              onChange={(event) => {
                revision.current += 1;
                setUrl(event.target.value);
                setResult(null);
              }}
              // placeholder={t("https://vn.shp.ee/... hoặc https://shopee.vn/product/...")}
              placeholder={t("Dán link sản phẩm vào đây nhé .... ")}
            />
            <Button type="submit" size="lg" disabled={loading || !url.trim()}>
              {loading ? <LoaderCircle className="animate-spin" /> : <Link2 />}
              {loading ? t("Đang tạo…") : t("Mua sắm ngay")}
            </Button>
          </div>
          {formError && (
            <p id="shopee-url-error" role="alert" className="text-danger mt-2 text-sm">
              {t(formError)}
            </p>
          )}
        </form>
        <div aria-live="polite" aria-busy={loading}>
          {result?.link && (
            <section
              className="border-success/20 bg-success-soft mt-6 rounded-2xl border p-4 sm:p-5"
              aria-label={t("Kết quả tạo link")}
            >
              <div className="text-success mb-4 flex items-center gap-2 text-sm font-semibold">
                <Check className="size-5" />
                {t("Piggy mang tới tin tốt cho bạn")}
              </div>
              <div className="flex items-start gap-4">
                <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-white sm:size-28">
                  {product?.imageUrl && !imageFailed ? (
                    // Provider images have dynamic hosts; retain native image loading and an error placeholder.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      className="size-full object-contain"
                      onError={() => setImageFailed(true)}
                    />
                  ) : (
                    <ImageOff
                      className="text-muted-foreground size-8"
                      aria-label={t("Chưa có ảnh sản phẩm")}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold break-words">
                    {product?.productName || t("Sản phẩm Shopee")}
                  </h2>
                  {product?.shopName && (
                    <p className="text-muted-foreground mt-1 text-sm break-words">
                      {product.shopName}
                    </p>
                  )}
                  <p className="mt-2 font-semibold">
                    {formatAmount(product?.price) ?? t("Chưa có thông tin giá")}
                  </p>
                </div>
              </div>
              <div className="my-5 rounded-xl bg-white p-4">
                <p className="text-sm font-medium">{t("Số tiền được hoàn lại lên tới")}</p>
                {/* Use the provider commission directly; this is not a calculated user cashback share. */}
                <p className="text-primary mt-1 text-4xl font-bold break-words">
                  {formatAmount(product?.commission) ?? t("Chưa có thông tin hoa hồng")}
                </p>
                <p className="text-muted-foreground mt-2 text-xs leading-5">
                  {t(
                    "Lưu ý nhỏ nhỏ: Đây là tham khảo, con số chính xác sẽ có sau khi Shopee, TikTok xác nhận nhé..",
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-3 xl:flex-row">
                <Button asChild size="lg">
                  <a href={result.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink />
                    {t("Mua ngay")}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={copy}
                  className="h-auto min-h-11 whitespace-normal"
                >
                  <Copy className="shrink-0" />
                  {t("Copy link chia sẻ cho bạn bè")}
                </Button>
              </div>
            </section>
          )}
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-3">
          <span className="bg-secondary text-primary grid size-10 shrink-0 place-items-center rounded-xl">
            <ShoppingCart />
          </span>
          <h2 className="font-semibold">{t("Vài lưu ý Piggy gửi tới bạn")}</h2>
        </div>
        <ol className="text-muted-foreground mt-5 space-y-4 text-sm leading-6">
          {[
            t("Nếu sản phẩm có trong giỏ hàng, bạn nhớ xóa ra khỏi giỏ nhe"),
            t("Nhấn “Mua ngay” trên trang này."),
            t("Thêm lại sản phẩm và tiến hành đặt hàng."),
            t("3 Điều trên giúp bạn hoàn tiền chính xác hơn đó!"),
          ].map((item, index) => (
            <li key={t(item)} className="flex gap-3">
              <span className="bg-secondary text-primary grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
        <p className="bg-muted text-muted-foreground mt-6 rounded-xl p-3 text-xs leading-5">
          {t(
            "Đây là các bước giúp bạn thuận lợi hơn trong việc được hoàn tiền nè. Tuy nhiên vẫn sẽ dựa vào trạng thái đơn hàng Shopee, TikTok nếu có dấu hiệu gian lận đó nhen.",
          )}
        </p>
      </Card>
    </div>
  );
}

export function GenerateLinkPage() {
  const t = useCopy();
  return (
    <Page
      title={t("Tạo link cashback")}
      description="Dán link sản phẩm Shopee để xem hoa hồng dự kiến và bắt đầu mua sắm."
    >
      <GenerateLinkPanel />
    </Page>
  );
}
