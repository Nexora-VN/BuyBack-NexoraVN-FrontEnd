"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
Link2,
LoaderCircle
} from "lucide-react";

import { ApiErrorNotice } from "@/components/errors/api-error-notice";
import type { GenerateLinkState } from "../hooks/use-generate-link";
export function GenerateLinkForm({ state }: { state: GenerateLinkState }) {
 const {t, formError, url, loading, changeUrl, generate} = state;
return <>
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
              onChange={(event) => changeUrl(event.target.value)}
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
<ApiErrorNotice error={state.requestError} /></>;
}
