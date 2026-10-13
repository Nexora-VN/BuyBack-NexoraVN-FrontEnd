import { expect, it } from "vitest";
import { withdrawalOptions } from "./withdrawal-options";

it("puts the full available balance last and keeps every option within policy limits", () => {
  expect(withdrawalOptions("23191", "10000")).toEqual([
    { value: "10000", label: "10k", all: false },
    { value: "20000", label: "20k", all: false },
    { value: "23191", label: "Toàn bộ", all: true },
  ]);
  expect(withdrawalOptions("23191", "50000")).toEqual([]);
  expect(withdrawalOptions("50000", "10000").at(-1)).toEqual({
    value: "50000",
    label: "Toàn bộ",
    all: true,
  });
});
