export type Point = { x: number; y: number };
export type BoardSize = { width: number; height: number };
export type GameContent =
  { kind: "text"; text: string } | { kind: "image"; src: string; alt: string };
export type MatchingMode = "memory" | "columns";
export type MatchingConfig = {
  defaultMode: MatchingMode;
  pairs: { id: string; left: GameContent; right: GameContent }[];
};
export type DragConfig = {
  board: BoardSize;
  items: {
    id: string;
    content: GameContent;
    position: Point;
    size: BoardSize;
  }[];
};
export type DrawingConfig = {
  board: BoardSize;
  background: { src: string; alt: string };
  colors: string[];
  brushSizes: number[];
  defaultColor: string;
  defaultBrushSize: number;
};
type Definition<T, C> = {
  id: string;
  version: number;
  type: T;
  title: string;
  instructions: string;
  config: C;
};
export type GameDefinition =
  | Definition<"matching", MatchingConfig>
  | Definition<"drag", DragConfig>
  | Definition<"drawing", DrawingConfig>;
export type MatchingState = {
  order: string[];
  selected: string[];
  matched: string[];
};
export type DragState = { positions: Record<string, Point>; order: string[] };
export type Stroke = {
  tool: "pen" | "eraser";
  color: string;
  /** Fraction of the board width, independent of display pixels. */
  width: number;
  points: Point[];
};
export type DrawingState = { strokes: Stroke[] };
