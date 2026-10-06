import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import AppProvider from "./app-provider";
import messages from "@/messages/vi.json";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each(["/", "/en", "/vi"])(
  "does not request a backend session on public landing %s",
  (pathname) => {
    route.pathname = pathname;
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ message: "Unavailable" }), { status: 503 }));
    vi.stubGlobal("fetch", fetch);
    render(
      <AppProvider locale="vi" messages={messages}>
        <h1>Public landing</h1>
      </AppProvider>,
    );
    expect(screen.getByRole("heading")).toHaveTextContent("Public landing");
    expect(fetch).not.toHaveBeenCalled();
  },
);

it("continues to bootstrap the session on the login page", async () => {
  route.pathname = "/login";
  const fetch = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ message: "Unavailable" }), { status: 503 }));
  vi.stubGlobal("fetch", fetch);
  render(
    <AppProvider locale="vi" messages={messages}>
      <h1>Sign in</h1>
    </AppProvider>,
  );
  await waitFor(() =>
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/backend/auth/me"),
      expect.objectContaining({ method: "GET", credentials: "include" }),
    ),
  );
});
