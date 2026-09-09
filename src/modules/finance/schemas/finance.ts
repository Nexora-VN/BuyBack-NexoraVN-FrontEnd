import { z } from 'zod';
const amount = z.string().regex(/^\d{1,18}$/, 'Nhập số nguyên VND');
export const withdrawalSchema = z.object({
  bankId: z.uuid('Chọn tài khoản ngân hàng'),
  amount: amount.refine(v => {
    try { return /^\d+$/.test(v) && BigInt(v) >= 50000n; } catch { return false; }
  }, 'Tối thiểu 50.000 VND'),
});
export const bankSchema = z.object({
  bankCode: z.string().trim().min(2), bankName: z.string().trim().min(2),
  accountHolder: z.string().trim().min(2), accountNumber: z.string().regex(/^[0-9]{6,30}$/, 'Số tài khoản gồm 6–30 chữ số'),
});
export const syncSchema = z.object({ startDate: z.iso.date(), endDate: z.iso.date() })
  .refine(v => {
    const s = Date.parse(v.startDate);
    const e = Date.parse(v.endDate);
    return !Number.isNaN(s) && !Number.isNaN(e) && e >= s && (e - s) < 90 * 86400000;
  }, 'Chọn khoảng 1–90 ngày');
export const settlementSchema = z.object({ reference: z.string().trim().min(5), grossVnd: amount, deductionVnd: amount, netVnd: amount })
  .refine(v => {
    try { return BigInt(v.grossVnd) - BigInt(v.deductionVnd) === BigInt(v.netVnd); } catch { return false; }
  }, 'Thực nhận phải bằng tổng trước phí trừ khấu trừ');
