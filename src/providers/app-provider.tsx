"use client";

import { NextIntlClientProvider } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, type ComponentProps } from "react";

import { AppErrorBoundary, RuntimeErrors } from "@/components/errors/runtime-errors";
import { InstallHomeButton } from "@/components/install-home-button";
import { timeZone, type Locale } from "@/i18n/config";
import { AuthProvider } from "@/modules/auth/components/auth-provider";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "sonner";

type IntlMessages = NonNullable<ComponentProps<typeof NextIntlClientProvider>["messages"]>;

type AppProviderProps = Readonly<{
  children: React.ReactNode;
  locale: Locale;
  messages: IntlMessages;
}>;

export default function AppProvider({ children, locale, messages }: AppProviderProps) {
  const pathname = usePathname();
  const isPublicLanding = pathname === "/" || pathname === "/vi" || pathname === "/en";
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      {isPublicLanding ? (
        children
      ) : (
        <QueryProvider>
          <AppErrorBoundary>
            <RuntimeErrors />
            <AuthProvider>
              {children}
              <InstallHomeButton />
            </AuthProvider>
          </AppErrorBoundary>
          <Toaster richColors position="top-right" />
        </QueryProvider>
      )}
    </NextIntlClientProvider>
  );
}
