import { renderUI } from "@/test/render";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NotificationPermissionPrompt } from "./notification-permission-prompt";
import * as authModule from "@/modules/auth/components/auth-provider";
import * as messagingModule from "@/lib/firebase/messaging";

vi.mock("@/modules/auth/components/auth-provider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/firebase/messaging", () => ({
  isPushNotificationSupported: vi.fn(),
  requestNotificationPermissionAndRegisterToken: vi.fn(),
}));

describe("NotificationPermissionPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("does not render when user is null", () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      refetch: vi.fn(),
    });

    const { container } = renderUI(<NotificationPermissionPrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not render when push notification is unsupported", async () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: { id: "user-1", email: "test@example.com", role: "USER" },
      loading: false,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      refetch: vi.fn(),
    });
    vi.mocked(messagingModule.isPushNotificationSupported).mockResolvedValue(false);

    const { container } = renderUI(<NotificationPermissionPrompt />);
    expect(container).toBeEmptyDOMElement();
  });
});
