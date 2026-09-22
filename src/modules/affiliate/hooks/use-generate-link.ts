"use client";
import { useCopy } from "@/i18n/use-copy";

import { affiliateService } from "@/modules/affiliate/services/affiliate.service";
import type { GenerateAffiliateResponse } from "@/modules/affiliate/types/affiliate";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useQueryClient } from "@tanstack/react-query";
const shopeeHosts = [
  "shopee.vn",
  "s.shopee.vn",
  "vn.shp.ee",
  "shp.ee",
  "shope.ee",
  "www.shopee.vn",
];
export function useGenerateLink() {
  const t = useCopy();

  const [formError, setFormError] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<GenerateAffiliateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const revision = useRef(0);
  const pending = useRef(false);
  const queryClient = useQueryClient();
  const [requestError, setRequestError] = useState<unknown>(null);

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setResult(null);
    setFormError("");
    setRequestError(null);
    const input = url.trim();
    try {
      const parsed = new URL(input);
      if (
        !shopeeHosts.includes(parsed.hostname) ||
        parsed.username ||
        parsed.password ||
        (parsed.port && parsed.port !== "443") ||
        !["https:"].includes(parsed.protocol)
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
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["affiliate"] });
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "finance" && String(query.queryKey[1]).includes("links"),
      });
      toast.success(t("Tạo link cashback thành công"));
    } catch (error) {
      if (requestRevision === revision.current) {
        setRequestError(error);
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
  const changeUrl = (value: string) => {
    revision.current += 1;
    setUrl(value);
    setResult(null);
    setRequestError(null);
  };
  return {
    changeUrl,
    t,
    formError,
    url,
    result,
    loading,
    imageFailed,
    revision,
    setUrl,
    setResult,
    setImageFailed,
    generate,
    copy,
    product,
    requestError,
  };
}
export type GenerateLinkState = ReturnType<typeof useGenerateLink>;
