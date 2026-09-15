export interface FinanceRow { id: string; [key: string]: unknown }
export interface FinanceList<T extends FinanceRow=FinanceRow> { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } }
export interface Dashboard {
  orders: number;
  operations?: { pendingWithdrawals: number; pendingBanks: number; openIssues: number };
  cashbackSummary?: { state: string; userAmount: string; count: number }[];
  wallet: { available: string; reserved: string };
  commissions: { state: string; _count: number; _sum: { estimatedVnd: string | null; settledVnd: string | null } }[];
}
export type Field = {
  name: string;
  label: string;
  type?: 'text' | 'password' | 'date' | 'textarea' | 'number' | 'select';
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
};

export interface SettlementEligibilityDTO { eligible: boolean; blockers: string[] }
export interface ProductSummary { name: string|null; imageUrl: string|null; itemCount: number }
export interface OrderRow extends FinanceRow { orderSn: string; status: string; productSummary: ProductSummary; checkout: { purchasedAt: string|null; commission: { state: string; cashback: { state: string; userAmount: string }|null }|null } }

export interface CommissionRow extends FinanceRow { state:string; userId:string|null; estimatedVnd:string; settlementEligibility:SettlementEligibilityDTO }
