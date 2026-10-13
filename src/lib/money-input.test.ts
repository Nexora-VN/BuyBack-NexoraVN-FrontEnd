import { describe, expect, it } from "vitest";
import { formatMoneyDigits, parseMoneyDigits } from "./money-input";

describe("money input", () => {
  it("formats Vietnamese thousands without changing the submitted integer", () => {
    expect(parseMoneyDigits("10.000")).toBe("10000");
    expect(formatMoneyDigits("10000")).toBe("10.000");
    expect(formatMoneyDigits("9007199254740993")).toBe("9.007.199.254.740.993");
  });

  it("supports negative wallet adjustments and removes pasted currency marks", () => {
    expect(parseMoneyDigits("-50.000 ₫", true)).toBe("-50000");
    expect(formatMoneyDigits("-50000")).toBe("-50.000");
    expect(parseMoneyDigits("-50.000 ₫")).toBe("50000");
  });
});
