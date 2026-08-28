import { describe, expect, it } from "vitest";
import { mockSeed } from "@/modules/mock/mocks/seed";

describe("mock data", () => {
  it("uses only current providers", () => { const values = JSON.stringify(mockSeed); expect(values).not.toMatch(/Lazada|Tiki/i); expect(values).toMatch(/Shopee|Saffi/); });
  it("keeps VND values as integers", () => { for (const order of mockSeed.orders) { expect(Number.isInteger(order.amount)).toBe(true); expect(Number.isInteger(order.commission)).toBe(true); expect(Number.isInteger(order.cashback)).toBe(true); } });
  it("keeps the expected 85 percent fixture allocation", () => { for (const order of mockSeed.orders) expect(Math.abs(order.cashback - Math.floor(order.commission * 0.85))).toBeLessThanOrEqual(1); });
});
