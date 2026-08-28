import type { PaginatedResponse } from "@/types/api";
export interface Product { id: string; itemId: string; shopId: string; productName: string; shopName: string; originLink: string; price: number; sales: number; imageUrl: string; productLink: string; rating: string; hasSellerCommission: boolean; hasShopeeCommission: boolean; commission: number; sellerComFinal: number; shoppeComFinal: number; sellerRate: number; shopeeRate: number; sellerRatePercent: number; shopeeRatePercent: number; totalRatePercent: number; isExtra: boolean; isCapped: boolean; isLimitCap: boolean; cap: string; capRow: string; capAfterRate: string; lastUpdate: string }
export type ProductInput = Omit<Product, "id">;
export type ProductList = PaginatedResponse<Product>;
