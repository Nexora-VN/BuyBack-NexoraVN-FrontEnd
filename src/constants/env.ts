export const env = {
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
  mockFutureModules: process.env.NEXT_PUBLIC_MOCK_FUTURE_MODULES !== "false",
} as const;
