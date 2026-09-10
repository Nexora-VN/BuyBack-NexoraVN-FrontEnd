export interface FinanceRow { id: string; [key: string]: unknown }
export interface FinanceList { data: FinanceRow[]; meta: { page: number; limit: number; total: number; totalPages: number } }
export interface Dashboard {
  orders: number;
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
