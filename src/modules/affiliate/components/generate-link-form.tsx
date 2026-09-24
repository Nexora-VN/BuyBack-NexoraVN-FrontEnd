"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircleX, ClipboardPaste, Link2, LoaderCircle } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { ApiErrorNotice } from "@/components/errors/api-error-notice";
import type { GenerateLinkState } from "../hooks/use-generate-link";

export function GenerateLinkForm({ state }: { state: GenerateLinkState }) {
  const { t, formError, url, loading, changeUrl, generate } = state;
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          changeUrl(text.trim());
          toast.success(t("Đã dán từ clipboard"));
          inputRef.current?.focus();
        } else {
          toast.error(t("Bộ nhớ tạm đang trống"));
        }
      } else {
        toast.error(t("Không thể truy cập bộ nhớ tạm"));
      }
    } catch {
      toast.error(t("Không thể truy cập bộ nhớ tạm"));
    }
  };

  const handleClear = () => {
    changeUrl("");
    inputRef.current?.focus();
  };

  return (
    <>
      <form onSubmit={generate}>
        <label htmlFor="shopee-url" className="text-sm font-semibold">
          {t("Link sản phẩm Shopee, TikTok")}
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              id="shopee-url"
              aria-invalid={!!formError}
              aria-describedby="shopee-url-error"
              value={url}
              onChange={(event) => changeUrl(event.target.value)}
              placeholder={t("Dán link sản phẩm vào đây nhé .... ")}
              className={url ? "pr-24" : "pr-18"}
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
              {url ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/80 flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors"
                  title={t("Xóa link")}
                  aria-label={t("Xóa link")}
                >
                  <CircleX className="size-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={handlePaste}
                className="bg-secondary text-primary hover:bg-secondary/80 inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold shadow-2xs transition active:scale-95"
                title={t("Dán từ clipboard")}
                aria-label={t("Dán")}
              >
                <ClipboardPaste className="size-3.5" />
                <span>{t("Dán")}</span>
              </button>
            </div>
          </div>
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
      <ApiErrorNotice error={state.requestError} />
    </>
  );
}
