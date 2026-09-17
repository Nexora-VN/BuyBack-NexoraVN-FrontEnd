import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";
export function renderUI(ui: ReactElement, locale: "vi" | "en" = "vi", options?: RenderOptions) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider
        locale={locale}
        messages={locale === "vi" ? viMessages : enMessages}
        timeZone="Asia/Ho_Chi_Minh"
      >
        {ui}
      </NextIntlClientProvider>
    </QueryClientProvider>,
    options,
  );
}
