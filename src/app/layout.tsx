import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { getLocale } from "next-intl/server";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BuyBack NexoraVN",
    template: "%s | BuyBack NexoraVN",
  },
  description: "Nền tảng hoàn tiền affiliate minh bạch từ NexoraVN.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={beVietnamPro.variable}>{children}</body>
    </html>
  );
}
