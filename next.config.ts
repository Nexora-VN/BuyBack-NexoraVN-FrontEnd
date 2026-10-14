import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  ...(process.env.NEXT_OUTPUT_MODE === "standalone" ? { output: "standalone" as const } : {}),
  reactCompiler: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.piggyback.vn" }],
        destination: "https://piggyback.vn/:path*",
        permanent: true,
      },
      {
        source: "/kien-thuc/cashback-la-gi",
        destination: "/kien-thuc/tien-hoan-la-gi",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cf.shopee.vn" },
      { protocol: "https", hostname: "down-vn.img.susercontent.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
