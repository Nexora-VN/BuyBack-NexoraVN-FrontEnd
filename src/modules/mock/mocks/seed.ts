import type { MockDatabase } from "@/modules/mock/types/mock";

export const mockSeed: MockDatabase = {
  links: [
    { id: "LNK-8921", sourceUrl: "https://shopee.vn/product/46182105/26771994719", affiliateUrl: "https://s.shopee.vn/an_redir?origin_link=...", product: "Giá đỡ điện thoại chống sốc", status: "WORKING", createdAt: "2026-08-27T08:20:53Z" },
    { id: "LNK-8918", sourceUrl: "https://vn.shp.ee/NWRHsAhy", affiliateUrl: "https://s.shopee.vn/an_redir?origin_link=...", product: "Tai nghe Bluetooth chống ồn", status: "WORKING", createdAt: "2026-08-25T05:10:00Z" },
  ],
  orders: [
    { id: "260821VN4VDXFE", product: "Giá đỡ điện thoại chống sốc", shop: "Citycase Official", amount: 134300, commission: 14102, cashback: 11987, status: "PENDING", providerStatus: "Pending", createdAt: "2026-08-27T08:20:53Z" },
    { id: "260815VN9KDP8A", product: "Tai nghe Bluetooth chống ồn", shop: "NexSound Store", amount: 890000, commission: 71200, cashback: 60520, status: "AVAILABLE", providerStatus: "Paid", createdAt: "2026-08-15T03:45:00Z" },
    { id: "260802VN2QLM7B", product: "Bình giữ nhiệt inox 1L", shop: "Home & Life", amount: 245000, commission: 12250, cashback: 10412, status: "REJECTED", providerStatus: "Rejected", createdAt: "2026-08-02T10:15:00Z" },
  ],
  ledger: [
    { id: "TXN-98234-A", user: "Nguyễn Văn An", type: "CASHBACK", amount: 60520, balanceAfter: 1250000, reference: "Shopee #260815VN9KDP8A", createdAt: "2026-08-24T10:23:00Z" },
    { id: "TXN-98233-W", user: "Trần Thị Bình", type: "WITHDRAWAL", amount: -500000, balanceAfter: 750000, reference: "Chuyển khoản VCB", createdAt: "2026-08-24T09:15:00Z" },
    { id: "TXN-98232-J", user: "Lê Văn Cường", type: "ADJUSTMENT", amount: 15000, balanceAfter: 315000, reference: "Phiếu hỗ trợ #102", createdAt: "2026-08-23T16:45:00Z" },
  ],
  withdrawals: [
    { id: "WDR-1042", amount: 500000, bank: "Vietcombank", account: "**** 2846", status: "PROCESSING", createdAt: "2026-08-27T04:30:00Z" },
    { id: "WDR-1031", amount: 300000, bank: "Techcombank", account: "**** 9912", status: "COMPLETED", createdAt: "2026-08-18T09:00:00Z" },
    { id: "WDR-1027", amount: 250000, bank: "MB Bank", account: "**** 4018", status: "REJECTED", createdAt: "2026-08-09T02:20:00Z" },
  ],
  reconciliations: [
    { id: "REC-20260827-01", provider: "Saffi", records: 1250, matched: 1228, mismatched: 22, status: "PROCESSING", createdAt: "2026-08-27T14:32:05Z" },
    { id: "REC-20260826-02", provider: "Shopee", records: 980, matched: 980, mismatched: 0, status: "COMPLETED", createdAt: "2026-08-26T14:31:12Z" },
  ],
};
