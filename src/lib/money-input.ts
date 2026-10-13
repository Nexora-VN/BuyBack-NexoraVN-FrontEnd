export function parseMoneyDigits(value: string, allowNegative = false): string {
  const negative = allowNegative && value.trimStart().startsWith("-");
  const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  return `${negative ? "-" : ""}${digits}`;
}

export function formatMoneyDigits(value: string): string {
  const negative = value.startsWith("-");
  const digits = value.replace(/\D/g, "");
  if (!digits) return negative ? "-" : "";
  return `${negative ? "-" : ""}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
