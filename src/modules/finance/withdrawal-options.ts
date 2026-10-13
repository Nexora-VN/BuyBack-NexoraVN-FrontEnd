export type WithdrawalOption = { value: string; label: string; all: boolean };

const QUICK_AMOUNTS = [10000n, 20000n, 50000n, 100000n, 200000n, 500000n];

export function withdrawalOptions(available: string, minimum: string): WithdrawalOption[] {
  if (!/^\d+$/.test(available) || !/^\d+$/.test(minimum)) return [];
  const balance = BigInt(available);
  const min = BigInt(minimum);
  if (balance <= 0n || balance < min) return [];
  const quick = QUICK_AMOUNTS.filter((value) => value >= min && value < balance).map((value) => ({
    value: value.toString(),
    label: value >= 1000n ? `${value / 1000n}k` : value.toString(),
    all: false,
  }));
  return [...quick, { value: available, label: "Toàn bộ", all: true }];
}
