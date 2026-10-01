export function validRequestId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
    const n = Number(c);
    const random =
      typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function"
        ? crypto.getRandomValues(new Uint8Array(1))[0]
        : (Math.random() * 256) | 0;
    return (n ^ (random & (15 >> (n / 4)))).toString(16);
  });
}

export const requestId = (value?: unknown) => (validRequestId(value) ? value : generateUUID());

