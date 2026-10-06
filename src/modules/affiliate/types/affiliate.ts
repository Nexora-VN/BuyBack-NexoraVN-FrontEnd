import type { PaginatedResponse } from "@/types/api";
export type AffiliateLinkStatus = "WORKING" | "FAILED";
export interface AffiliateLink {
  id: string;
  subId1: string | null;
  subId2: string | null;
  subId3: string | null;
  subId4: string | null;
  subId5: string | null;
  originLink: string;
  cleanLink: string;
  convertOrigin: string;
  fullLinkSystem: string | null;
  shortLink: string | null;
  longLink: string | null;
  failCode: number | null;
  affiliateLinkStatus: AffiliateLinkStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  productId: string;
}
export type AffiliateList = PaginatedResponse<AffiliateLink>;
export interface GeneratedProduct {
  id: string;
  itemId?: string;
  shopId?: string;
  productName: string;
  shopName: string;
  originLink?: string;
  imageUrl: string;
  productLink?: string;
  price: string | null;
  sales?: number | null;
  rating?: string | null;
  commission: string | null;
  sellerComFinal?: string | null;
  shoppeComFinal?: string | null;
  sellerRate?: number | null;
  shopeeRate?: number | null;
  sellerRatePercent?: number | null;
  shopeeRatePercent?: number | null;
  totalRatePercent?: number | null;
  isExtra?: boolean | null;
  isCapped?: boolean | null;
  isLimitCap?: boolean | null;
  cap?: string | null;
  capRow?: string | null;
  capAfterRate?: string | null;
}
export interface GenerateAffiliateResponse {
  link: string | null;
  code: string | number | null;
  product?: GeneratedProduct | null;
  estimatedUserCashbackVnd?: string | null;
}
