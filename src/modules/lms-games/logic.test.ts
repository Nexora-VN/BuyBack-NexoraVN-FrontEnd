import { describe, expect, it } from "vitest";
import demo from "./demo-games.json";
import {
  boundPosition,
  makeCards,
  normalizedPoint,
  selectCard,
  shuffle,
} from "./logic";
import type { GameDefinition, MatchingConfig, MatchingState } from "./types";

const config: MatchingConfig = {
  defaultMode: "memory",
  pairs: ["a", "b"].map((id) => ({
    id,
    left: { kind: "text", text: id },
    right: { kind: "text", text: id },
  })),
};
const initial = (): MatchingState => ({
  order: makeCards(config).map((card) => card.id),
  selected: [],
  matched: [],
});

describe("matching rules", () => {
  it("only matches distinct cards of the same pair and does not mutate input", () => {
    const start = initial();
    const first = selectCard(start, "a:left", config);
    expect(selectCard(first, "a:left", config)).toBe(first);
    const matched = selectCard(first, "a:right", config);
    expect(matched.matched).toEqual(["a"]);
    expect(matched.selected).toEqual([]);
    expect(selectCard(matched, "a:left", config)).toBe(matched);
    expect(start).toEqual(initial());
  });
  it("locks further choices after a mismatch until cleared", () => {
    const mismatch = selectCard(
      selectCard(initial(), "a:left", config),
      "b:right",
      config,
    );
    expect(mismatch.matched).toEqual([]);
    expect(selectCard(mismatch, "a:right", config)).toBe(mismatch);
    expect(
      selectCard({ ...mismatch, selected: [] }, "a:right", config).selected,
    ).toEqual(["a:right"]);
  });
  it("ignores unknown cards and preserves every item in a shuffle", () => {
    const start = initial();
    expect(selectCard(start, "missing", config)).toBe(start);
    expect(shuffle(start.order).sort()).toEqual([...start.order].sort());
    expect(start.order).toEqual(initial().order);
  });
});

describe("responsive coordinates", () => {
  it("maps the same relative position at different screen sizes", () => {
    expect(
      normalizedPoint(160, 120, { left: 10, top: 20, width: 300, height: 200 }),
    ).toEqual({ x: 0.5, y: 0.5 });
    expect(
      normalizedPoint(310, 220, { left: 10, top: 20, width: 600, height: 400 }),
    ).toEqual({ x: 0.5, y: 0.5 });
  });
  it("bounds the whole object and clips drawing points outside the board", () => {
    expect(boundPosition({ x: 4, y: -2 }, { width: 0.2, height: 0.3 })).toEqual(
      { x: 0.8, y: 0 },
    );
    expect(
      normalizedPoint(-20, 900, { left: 0, top: 0, width: 300, height: 200 }),
    ).toEqual({ x: 0, y: 1 });
  });
});

it("ships valid, serializable demo definitions with stable unique IDs", () => {
  const games = demo as GameDefinition[];
  expect(JSON.parse(JSON.stringify(games))).toEqual(games);
  expect(new Set(games.map((game) => game.id)).size).toBe(3);
  for (const game of games) {
    expect(game.version).toBe(1);
    if (game.type === "matching")
      expect(new Set(makeCards(game.config).map((card) => card.id)).size).toBe(
        10,
      );
    if (game.type === "drag")
      for (const item of game.config.items)
        expect(boundPosition(item.position, item.size)).toEqual(item.position);
    if (game.type === "drawing") {
      expect(game.config.colors).toContain(game.config.defaultColor);
      expect(game.config.brushSizes).toContain(game.config.defaultBrushSize);
    }
  }
});
