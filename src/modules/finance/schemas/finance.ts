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
    return !Number.isNaN(s) && !Number.isNaN(e) && e >= s;
  }, 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu');
export const settlementSchema = z.object({ reference: z.string().trim().min(5), grossVnd: amount, deductionVnd: amount, netVnd: amount })
  .refine(v => {
    try { return BigInt(v.grossVnd) - BigInt(v.deductionVnd) === BigInt(v.netVnd); } catch { return false; }
  }, 'Thực nhận phải bằng tổng trước phí trừ khấu trừ');

export const providerCredentialSchema = z.object({
  accountId: z.string().regex(/^\d{1,30}$/, 'Account ID phải là các chữ số'),
  expectedAffiliate: z.string().trim().min(1, 'Nhập tên affiliate kỳ vọng'),
});

export const providerVerificationSchema = z.object({
  version: z.coerce.number().int().positive('Phiên bản credential phải là số nguyên dương'),
  evidence: z.string().trim().min(10, 'Bằng chứng đối chiếu tối thiểu 10 ký tự'),
});

export const structuredReviewSchema = z.object({
  action: z.enum(['APPROVE', 'EXCLUDE']),
  affiliateLinkId: z.string().uuid('Mã liên kết affiliate không hợp lệ').optional().or(z.literal('')),
  acceptedAmountVnd: amount.optional().or(z.literal('')),
  revision: z.coerce.number().int().positive('Revision phải là số nguyên dương').optional().or(z.literal('')),
  evidence: z.string().trim().min(10, 'Bằng chứng đối chiếu tối thiểu 10 ký tự'),
});
