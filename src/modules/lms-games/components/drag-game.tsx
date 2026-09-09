"use client";

import { useRef, useState } from "react";
import { Move, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { boundPosition, normalizedPoint } from "../logic";
import type { DragConfig, DragState, Point } from "../types";
import { GameContent } from "./game-content";

export function DragGame({
  config,
  onChange,
}: {
  config: DragConfig;
  onChange?: (state: DragState) => void;
}) {
  const initial = (): DragState => ({
    positions: Object.fromEntries(
      config.items.map((item) => [
        item.id,
        boundPosition(item.position, item.size),
      ]),
    ),
    order: config.items.map((item) => item.id),
  });
  const [state, setState] = useState(initial);
  const live = useRef(state);
  const [selected, setSelected] = useState<string | null>(null);
  const board = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; pointerId: number; offset: Point } | null>(
    null,
  );
  const update = (next: DragState) => {
    live.current = next;
    setState(next);
    onChange?.(next);
  };
  const select = (id: string) => {
    setSelected(id);
    update({
      ...live.current,
      order: [...live.current.order.filter((value) => value !== id), id],
    });
  };
  const move = (id: string, point: Point) => {
    const item = config.items.find((value) => value.id === id)!;
    update({
      ...live.current,
      positions: {
        ...live.current.positions,
        [id]: boundPosition(point, item.size),
      },
    });
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Move className="size-4 shrink-0" />
          Kéo hình đến bất kỳ đâu. Chọn hình và dùng phím mũi tên cũng được.
        </p>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => {
            drag.current = null;
            setSelected(null);
            update(initial());
          }}
        >
          <RotateCcw />
          Vị trí ban đầu
        </Button>
      </div>
      <div
        ref={board}
        aria-label="Bảng kéo thả tự do"
        className="relative isolate w-full overflow-hidden rounded-2xl border-2 border-dashed bg-secondary/30"
        style={{
          aspectRatio: `${config.board.width}/${config.board.height}`,
          backgroundImage:
            "radial-gradient(var(--border) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      >
        {config.items.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Di chuyển ${item.content.kind === "image" ? item.content.alt : item.content.text}`}
            aria-pressed={selected === item.id}
            onFocus={() => select(item.id)}
            onPointerDown={(event) => {
              if (!event.isPrimary || event.button !== 0 || !board.current)
                return;
              event.preventDefault();
              event.currentTarget.focus();
              select(item.id);
              const point = normalizedPoint(
                event.clientX,
                event.clientY,
                board.current.getBoundingClientRect(),
              );
              const position = live.current.positions[item.id];
              drag.current = {
                id: item.id,
                pointerId: event.pointerId,
                offset: { x: point.x - position.x, y: point.y - position.y },
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const active = drag.current;
              if (
                !active ||
                active.pointerId !== event.pointerId ||
                !board.current
              )
                return;
              const point = normalizedPoint(
                event.clientX,
                event.clientY,
                board.current.getBoundingClientRect(),
              );
              move(active.id, {
                x: point.x - active.offset.x,
                y: point.y - active.offset.y,
              });
            }}
            onPointerUp={(event) => {
              if (drag.current?.pointerId === event.pointerId) {
                drag.current = null;
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onLostPointerCapture={() => {
              drag.current = null;
            }}
            onKeyDown={(event) => {
              const delta: Record<string, Point> = {
                ArrowLeft: { x: -1, y: 0 },
                ArrowRight: { x: 1, y: 0 },
                ArrowUp: { x: 0, y: -1 },
                ArrowDown: { x: 0, y: 1 },
              };
              if (!delta[event.key]) return;
              event.preventDefault();
              select(item.id);
              const step = event.shiftKey ? 0.05 : 0.01;
              const position = live.current.positions[item.id];
              move(item.id, {
                x: position.x + delta[event.key].x * step,
                y: position.y + delta[event.key].y * step,
              });
            }}
            className={`absolute flex touch-none select-none items-center justify-center rounded-xl border-2 bg-card p-1 shadow-sm sm:p-3 ${selected === item.id ? "cursor-grabbing border-primary" : "cursor-grab border-border hover:border-primary/50"}`}
            style={{
              left: `${state.positions[item.id].x * 100}%`,
              top: `${state.positions[item.id].y * 100}%`,
              width: `${item.size.width * 100}%`,
              height: `${item.size.height * 100}%`,
              zIndex: state.order.indexOf(item.id) + 1,
            }}
          >
            <GameContent content={item.content} />
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Không có đáp án đúng sai. Hãy sắp xếp theo câu chuyện của bạn.
      </p>
    </div>
  );
}
