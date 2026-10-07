import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderUI } from "@/test/render";
import { authService } from "../services/auth.service";
import { SignUpPageContent } from "./sign-up-page";

const replace = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ replace }),
}));
vi.mock("../services/auth.service", () => ({
  authService: { registerStart: vi.fn(), registerResend: vi.fn(), registerVerify: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  vi.mocked(authService.registerStart).mockResolvedValue({
    expiresInSeconds: 600,
    resendAfterSeconds: 60,
  });
  vi.mocked(authService.registerVerify).mockResolvedValue(undefined);
});
afterEach(cleanup);

it("sends only the required fields, accepts a six-digit code, and returns to login", async () => {
  renderUI(<SignUpPageContent />);
  fireEvent.change(screen.getByLabelText("Họ và tên"), { target: { value: "Test Person" } });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "  PERSON@example.com  " },
  });
  fireEvent.change(screen.getByLabelText("Mật khẩu"), {
    target: { value: "safe-password-123" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Gửi mã xác thực" }));
  await waitFor(() =>
    expect(authService.registerStart).toHaveBeenCalledWith({
      name: "Test Person",
      email: "person@example.com",
      password: "safe-password-123",
    }),
  );
  const code = await screen.findByRole("textbox", { name: "Mã xác thực gồm 6 chữ số" });
  fireEvent.change(code, { target: { value: "123456" } });
  fireEvent.click(screen.getByRole("button", { name: "Xác thực và tạo tài khoản" }));
  await waitFor(() =>
    expect(authService.registerVerify).toHaveBeenCalledWith("person@example.com", "123456"),
  );
  expect(replace).toHaveBeenCalledWith("/login");
  expect(sessionStorage.getItem("auth.loginEmail")).toBe("person@example.com");
});
