export type MockStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED" | "AVAILABLE" | "VALIDATED" | "FAILED";
export interface MockOrder { id: string; product: string; shop: string; amount: number; commission: number; cashback: number; status: MockStatus; providerStatus: string; createdAt: string }
export interface MockLink { id: string; sourceUrl: string; affiliateUrl: string; product: string; status: "WORKING" | "FAILED"; createdAt: string }
export interface MockLedger { id: string; user: string; type: "CASHBACK" | "WITHDRAWAL" | "ADJUSTMENT"; amount: number; balanceAfter: number; reference: string; createdAt: string }
export interface MockWithdrawal { id: string; amount: number; bank: string; account: string; status: MockStatus; createdAt: string }
export interface MockReconciliation { id: string; provider: "Saffi" | "Shopee"; records: number; matched: number; mismatched: number; status: MockStatus; createdAt: string }
export interface MockDatabase { links: MockLink[]; orders: MockOrder[]; ledger: MockLedger[]; withdrawals: MockWithdrawal[]; reconciliations: MockReconciliation[] }
