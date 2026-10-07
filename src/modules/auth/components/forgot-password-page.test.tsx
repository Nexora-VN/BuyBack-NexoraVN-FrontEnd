import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderUI } from "@/test/render";
import { authService } from "../services/auth.service";
import { ForgotPasswordPageContent } from "./forgot-password-page";

const replace = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ replace }),
}));
vi.mock("../services/auth.service", () => ({
  authService: { passwordResetStart: vi.fn(), passwordResetConfirm: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  vi.mocked(authService.passwordResetStart).mockResolvedValue({
    expiresInSeconds: 600,
    resendAfterSeconds: 60,
  });
  vi.mocked(authService.passwordResetConfirm).mockResolvedValue(undefined);
});
afterEach(cleanup);

it("requires matching passwords before confirming the six-digit code", async () => {
  renderUI(<ForgotPasswordPageContent />);
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "PERSON@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Gửi mã đặt lại" }));
  await waitFor(() =>
    expect(authService.passwordResetStart).toHaveBeenCalledWith("person@example.com"),
  );
  const code = await screen.findByRole("textbox", { name: "Mã xác thực gồm 6 chữ số" });
  fireEvent.change(code, { target: { value: "123456" } });
  fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
    target: { value: "new-safe-password-123" },
  });
  fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu mới"), {
    target: { value: "different-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Cập nhật mật khẩu" }));
  expect(await screen.findByText("Hai mật khẩu không khớp")).toBeInTheDocument();
  expect(authService.passwordResetConfirm).not.toHaveBeenCalled();

  fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu mới"), {
    target: { value: "new-safe-password-123" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Cập nhật mật khẩu" }));
  await waitFor(() =>
    expect(authService.passwordResetConfirm).toHaveBeenCalledWith({
      email: "person@example.com",
      code: "123456",
      password: "new-safe-password-123",
      confirmPassword: "new-safe-password-123",
    }),
  );
  expect(replace).toHaveBeenCalledWith("/login");
  expect(sessionStorage.getItem("auth.loginEmail")).toBe("person@example.com");
});
