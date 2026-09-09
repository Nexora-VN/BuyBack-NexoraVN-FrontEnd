import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MatchingGame } from "./matching-game";
import type { MatchingConfig } from "../types";

const config: MatchingConfig = {
  defaultMode: "columns",
  pairs: ["A", "B"].map((id) => ({
    id,
    left: { kind: "text", text: `${id} trái` },
    right: { kind: "text", text: `${id} phải` },
  })),
};
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("completes once, disables matches, and starts a clean round", () => {
  const onComplete = vi.fn();
  render(<MatchingGame config={config} onComplete={onComplete} />);
  for (const id of ["A", "B"]) {
    fireEvent.click(screen.getByRole("button", { name: `${id} trái` }));
    fireEvent.click(screen.getByRole("button", { name: `${id} phải` }));
  }
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(
    screen.getByRole("button", { name: "A trái, đã ghép" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Chơi lại" }));
  expect(screen.getByText("Đã ghép 0/2 cặp")).toBeInTheDocument();
});

it("locks mismatches for 800ms and cancels pending work on mode changes", () => {
  vi.useFakeTimers();
  const onChange = vi.fn();
  render(<MatchingGame config={config} onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: "A trái" }));
  fireEvent.click(screen.getByRole("button", { name: "B phải" }));
  expect(screen.getByRole("button", { name: "B trái" })).toBeDisabled();
  act(() => vi.advanceTimersByTime(800));
  expect(screen.getByRole("button", { name: "B trái" })).not.toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "A trái" }));
  fireEvent.click(screen.getByRole("button", { name: "B phải" }));
  fireEvent.click(screen.getByRole("button", { name: "Lưới ghi nhớ" }));
  const calls = onChange.mock.calls.length;
  act(() => vi.advanceTimersByTime(1000));
  expect(onChange).toHaveBeenCalledTimes(calls);
  expect(screen.getAllByRole("button", { name: /^Lật thẻ/ })).toHaveLength(4);
});
