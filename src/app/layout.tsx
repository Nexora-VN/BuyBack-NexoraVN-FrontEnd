import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Be_Vietnam_Pro } from "next/font/google";
import { siteUrl } from "@/lib/seo/site";
import { AnalyticsConsent } from "@/components/analytics-consent";

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
  description: "Nền tảng mua sắm hoàn tiền minh bạch từ Piggy Back.",
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
      <body className={beVietnamPro.variable}>
        {children}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <AnalyticsConsent
            measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
            locale={locale}
          />
        )}
      </body>
    </html>
  );
}
