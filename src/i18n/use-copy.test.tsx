import { renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import enMessages from "@/messages/en.json";
import viMessages from "@/messages/vi.json";
import { useCopy } from "./use-copy";

describe("useCopy error translation", () => {
  it("translates Invalid email or password correctly in Vietnamese", () => {
    const { result } = renderHook(() => useCopy(), {
      wrapper: ({ children }) => (
        <NextIntlClientProvider locale="vi" messages={viMessages}>
          {children}
        </NextIntlClientProvider>
      ),
    });

    expect(result.current.error("Invalid email or password")).toBe(
      "Email hoặc mật khẩu không đúng",
    );
    expect(result.current.error("Invalid credentials")).toBe("Email hoặc mật khẩu không đúng");
  });

  it("translates Invalid email or password correctly in English", () => {
    const { result } = renderHook(() => useCopy(), {
      wrapper: ({ children }) => (
        <NextIntlClientProvider locale="en" messages={enMessages}>
          {children}
        </NextIntlClientProvider>
      ),
    });

    expect(result.current.error("Invalid email or password")).toBe("Incorrect email or password");
    expect(result.current.error("Invalid credentials")).toBe("Incorrect email or password");
  });
});
