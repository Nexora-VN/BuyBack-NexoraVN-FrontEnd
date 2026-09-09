import type { BoardSize, MatchingConfig, MatchingState, Point } from "./types";

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function makeCards(config: MatchingConfig) {
  return config.pairs.flatMap((pair) => [
    {
      id: `${pair.id}:left`,
      pairId: pair.id,
      side: "left" as const,
      content: pair.left,
    },
    {
      id: `${pair.id}:right`,
      pairId: pair.id,
      side: "right" as const,
      content: pair.right,
    },
  ]);
}

export function selectCard(
  state: MatchingState,
  id: string,
  config: MatchingConfig,
): MatchingState {
  const cards = makeCards(config);
  const card = cards.find((item) => item.id === id);
  if (
    !card ||
    state.selected.length === 2 ||
    state.selected.includes(id) ||
    state.matched.includes(card.pairId)
  )
    return state;
  const selected = [...state.selected, id];
  const first = cards.find((item) => item.id === selected[0]);
  if (selected.length === 2 && first?.pairId === card.pairId) {
    return { ...state, selected: [], matched: [...state.matched, card.pairId] };
  }
  return { ...state, selected };
}

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
export function normalizedPoint(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): Point {
  return {
    x: clamp((clientX - rect.left) / Math.max(rect.width, 1)),
    y: clamp((clientY - rect.top) / Math.max(rect.height, 1)),
  };
}
export function boundPosition(point: Point, size: BoardSize): Point {
  return {
    x: clamp(point.x, 0, Math.max(0, 1 - size.width)),
    y: clamp(point.y, 0, Math.max(0, 1 - size.height)),
  };
}
