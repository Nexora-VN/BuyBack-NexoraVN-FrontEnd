import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Be_Vietnam_Pro } from "next/font/google";
import { siteUrl } from "@/lib/seo/site";

import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Piggy Back",
    template: "%s | Piggy Back",
  },
  description: "Nền tảng hoàn tiền affiliate minh bạch từ Piggy Back.",
  appleWebApp: { capable: true, title: "Piggy Back", statusBarStyle: "default" },
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
  },
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
