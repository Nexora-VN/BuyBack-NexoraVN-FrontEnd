function validItemId(value: unknown): string | null {
  if (typeof value === "number" && !Number.isSafeInteger(value)) return null;
  if (!["string", "number", "bigint"].includes(typeof value)) return null;
  const id = String(value);
  return /^[1-9]\d{0,18}$/.test(id) && BigInt(id) <= 9223372036854775807n ? id : null;
}

/** Older order payloads may only carry an AddLiveTag or Shopee product URL. */
export function productItemId(value: unknown, productUrl?: string | null): string | null {
  const id = validItemId(value);
  if (id) return id;
  if (!productUrl) return null;
  try {
    const url = new URL(productUrl);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    if (["addlivetag.com", "www.addlivetag.com"].includes(url.hostname)) {
      return validItemId(url.searchParams.get("item_id"));
    }
    if (url.hostname === "shopee.vn" || url.hostname.endsWith(".shopee.vn")) {
      return validItemId(
        /^\/product\/\d+\/(\d+)\/?$/.exec(url.pathname)?.[1] ??
          /-i\.\d+\.(\d+)\/?$/.exec(url.pathname)?.[1],
      );
    }
  } catch {
    return null;
  }
  return null;
}
