import type { Stroke } from "./types";

/** Draw only the annotation layer; the background is a separate image element. */
export function paintStrokes(
  context: CanvasRenderingContext2D,
  strokes: Stroke[],
  width: number,
  height: number,
) {
  context.clearRect(0, 0, width, height);
  for (const stroke of strokes) {
    if (!stroke.points.length) continue;
    context.globalCompositeOperation =
      stroke.tool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = stroke.color;
    context.fillStyle = stroke.color;
    context.lineWidth = stroke.width * width;
    context.lineCap = "round";
    context.lineJoin = "round";
    const first = stroke.points[0];
    context.beginPath();
    if (stroke.points.length === 1) {
      context.arc(
        first.x * width,
        first.y * height,
        context.lineWidth / 2,
        0,
        Math.PI * 2,
      );
      context.fill();
    } else {
      context.moveTo(first.x * width, first.y * height);
      for (const point of stroke.points.slice(1))
        context.lineTo(point.x * width, point.y * height);
      context.stroke();
    }
  }
  context.globalCompositeOperation = "source-over";
}
