import type { PaginatedResponse } from "@/types/api";
export interface Product {
  id: string;
  itemId: string;
  shopId: string;
  productName: string;
  shopName: string;
  originLink: string;
  price: string;
  sales: number;
  imageUrl: string;
  productLink: string;
  rating: string;
  hasSellerCommission: boolean;
  hasShopeeCommission: boolean;
  commission: string;
  sellerComFinal: string;
  shoppeComFinal: string;
  sellerRate: number;
  shopeeRate: number;
  sellerRatePercent: number;
  shopeeRatePercent: number;
  totalRatePercent: number;
  isExtra: boolean;
  isCapped: boolean;
  isLimitCap: boolean;
  cap: string;
  capRow: string;
  capAfterRate: string;
  lastUpdate: string;
}
export type ProductInput = Omit<
  Product,
  "id" | "price" | "commission" | "sellerComFinal" | "shoppeComFinal"
> & { price: number; commission: number; sellerComFinal: number; shoppeComFinal: number };
export type ProductList = PaginatedResponse<Product>;

export interface CatalogProduct {
  itemId: string;
  shopId: string;
  productName: string;
  shopName: string;
  price: string;
  imageUrl: string;
  productUrl: string;
  rating: string;
  sales: number;
  isExtra: boolean;
  lastUpdate: string;
  dataStatus: "current" | "saved";
  estimatedUserCashbackVnd: string | null;
  priceStats: {
    minPrice: string;
    maxPrice: string;
    avgPrice: string;
    priceChange7d: string;
    priceChange30d: string;
    lastPriceUpdate: string;
  } | null;
}
