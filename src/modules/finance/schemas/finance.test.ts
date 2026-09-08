import { describe, expect, it } from 'vitest';
import { bankSchema, settlementSchema, syncSchema, withdrawalSchema } from './finance';
import { formatVnd } from '@/lib/format';
describe('Financial forms', () => {
  it('preserves VND beyond JavaScript safe integer precision', () => {
    expect(formatVnd('9007199254740993')).toBe('9.007.199.254.740.993 ₫');
  });
  it('rejects fractional or below-minimum withdrawals', () => {
    const bankId='a5d9575f-4c29-4f34-b6e0-a5bb80fc12a8';
    expect(withdrawalSchema.safeParse({bankId,amount:'49999'}).success).toBe(false);
    expect(withdrawalSchema.safeParse({bankId,amount:'50000.5'}).success).toBe(false);
    expect(withdrawalSchema.safeParse({bankId,amount:'50000'}).success).toBe(true);
  });
  it('requires matching settlement totals', () => {
    expect(settlementSchema.safeParse({reference:'REF001',grossVnd:'100000',deductionVnd:'1000',netVnd:'99000'}).success).toBe(true);
    expect(settlementSchema.safeParse({reference:'REF001',grossVnd:'100000',deductionVnd:'1000',netVnd:'100000'}).success).toBe(false);
  });
  it('validates bank accounts and actual calendar ranges', () => {
    expect(bankSchema.safeParse({bankCode:'VCB',bankName:'Vietcombank',accountHolder:'Test User',accountNumber:'abc'}).success).toBe(false);
    expect(syncSchema.safeParse({startDate:'2026-02-30',endDate:'2026-03-01'}).success).toBe(false);
  });
});
