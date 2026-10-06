import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import HomePage from "./page";

vi.mock("next-intl/server", () => ({ setRequestLocale: vi.fn() }));
vi.mock("@/i18n/navigation", () => ({
  redirect: () => {
    throw new Error("Public homepage redirected to login");
  },
}));

afterEach(cleanup);

it("lets a Vietnamese visitor read the service and FAQs before signing in", async () => {
  const { container } = render(await HomePage({ params: Promise.resolve({ locale: "vi" }) }));
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mua sắm");
  expect(screen.getAllByRole("link", { name: /Bắt đầu/ })[0]).toHaveAttribute("href", "/login");
  expect(container.querySelectorAll("details").length).toBeGreaterThanOrEqual(5);
  const data = JSON.parse(
    container.querySelector('script[type="application/ld+json"]')!.textContent!,
  );
  const faq = data["@graph"].find((entry: { "@type": string }) => entry["@type"] === "FAQPage");
  for (const question of faq.mainEntity) {
    expect(screen.getByText(question.name)).toBeInTheDocument();
    expect(screen.getByText(question.acceptedAnswer.text)).toBeInTheDocument();
  }
});

it("keeps English visitors in English when they start or switch language", async () => {
  render(await HomePage({ params: Promise.resolve({ locale: "en" }) }));
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("shopping");
  expect(screen.getAllByRole("link", { name: /Get started/ })[0]).toHaveAttribute(
    "href",
    "/en/login",
  );
  expect(screen.getByRole("link", { name: "Tiếng Việt" })).toHaveAttribute("href", "/");
});
