import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderUI } from "@/test/render";
import { AuthProvider, useAuth } from "./auth-provider";
import { authService } from "../services/auth.service";
import { toast } from "sonner";

vi.mock("../services/auth.service", () => ({
  authService: { me: vi.fn(), login: vi.fn(), loginWithGoogle: vi.fn(), logout: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function LogoutButton() {
  const { logout, user } = useAuth();
  return (
    <>
      <button onClick={() => void logout()}>Đăng xuất</button>
      {user && <span>{user.email}</span>}
    </>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authService.me).mockResolvedValue({
    id: "user-1",
    email: "user@example.com",
    role: "USER",
  } as never);
  vi.mocked(authService.logout).mockResolvedValue(undefined);
});
afterEach(cleanup);

it("confirms logout after clearing the session", async () => {
  renderUI(
    <AuthProvider>
      <LogoutButton />
    </AuthProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Đăng xuất" }));
  await waitFor(() => expect(authService.logout).toHaveBeenCalledOnce());
  expect(toast.success).toHaveBeenCalledWith("Đã đăng xuất");
});

it("reports failure instead of success when the server cannot log out", async () => {
  vi.mocked(authService.logout).mockRejectedValue(new Error("Network error"));
  renderUI(
    <AuthProvider>
      <LogoutButton />
    </AuthProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Đăng xuất" }));
  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith("Không thể đăng xuất. Vui lòng thử lại."),
  );
  expect(toast.success).not.toHaveBeenCalled();
});

it("clears the app session after logout", async () => {
  renderUI(
    <AuthProvider>
      <LogoutButton />
    </AuthProvider>,
  );
  await screen.findByText("user@example.com");
  fireEvent.click(screen.getByRole("button", { name: "Đăng xuất" }));
  await waitFor(() => expect(screen.queryByText("user@example.com")).not.toBeInTheDocument());
  expect(authService.logout).toHaveBeenCalledOnce();
});
