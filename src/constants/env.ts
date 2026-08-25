export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.trim() || undefined,
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
} as const;
