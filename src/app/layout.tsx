import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Be_Vietnam_Pro } from "next/font/google";

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
    default: "Piggy Buy Back",
    template: "%s | Piggy Buy Back",
  },
  description: "Nền tảng hoàn tiền affiliate minh bạch từ NexoraVN.",
};

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  "pk_test_bW9yYWwtc3dpbmUtNDE4MC5jbGVyay5hY2NvdW50cy5kZXYk";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={beVietnamPro.variable}>
        <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
      </body>
    </html>
  );
}
