"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, Eraser, Paintbrush, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizedPoint } from "../logic";
import { paintStrokes } from "../drawing";
import type { DrawingConfig, DrawingState, Stroke } from "../types";

export function DrawingGame({
  config,
  onChange,
}: {
  config: DrawingConfig;
  onChange?: (state: DrawingState) => void;
}) {
  const helpId = useId();
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const active = useRef<{ pointerId: number; stroke: Stroke } | null>(null);
  const frame = useRef<number | null>(null);
  const [count, setCount] = useState(0);
  const [tool, setTool] = useState<Stroke["tool"]>("pen");
  const [color, setColor] = useState(config.defaultColor);
  const [size, setSize] = useState(config.defaultBrushSize);
  const repaint = useCallback(() => {
    const element = canvas.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (element.width !== width || element.height !== height) {
      element.width = width;
      element.height = height;
    }
    const context = element.getContext("2d");
    if (context)
      paintStrokes(
        context,
        active.current
          ? [...strokes.current, active.current.stroke]
          : strokes.current,
        width,
        height,
      );
  }, []);
  const schedule = () => {
    if (frame.current === null)
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        repaint();
      });
  };
  useEffect(() => {
    const observer = new ResizeObserver(repaint);
    if (canvas.current) observer.observe(canvas.current);
    window.addEventListener("resize", repaint);
    repaint();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", repaint);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [repaint]);
  const notify = () => {
    setCount(strokes.current.length);
    onChange?.({ strokes: strokes.current });
    repaint();
  };
  const finish = (pointerId: number, cancel = false) => {
    if (!active.current || active.current.pointerId !== pointerId) return;
    if (!cancel) strokes.current = [...strokes.current, active.current.stroke];
    active.current = null;
    notify();
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-background p-3">
        <div className="flex gap-2" role="group" aria-label="Công cụ vẽ">
          <Button
            className="min-h-11"
            variant={tool === "pen" ? "default" : "outline"}
            aria-pressed={tool === "pen"}
            onClick={() => setTool("pen")}
          >
            <Paintbrush />
            Bút
          </Button>
          <Button
            className="min-h-11"
            variant={tool === "eraser" ? "default" : "outline"}
            aria-pressed={tool === "eraser"}
            onClick={() => setTool("eraser")}
          >
            <Eraser />
            Tẩy
          </Button>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Màu bút">
          {config.colors.map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`Màu ${value}`}
              aria-pressed={color === value}
              onClick={() => {
                setColor(value);
                setTool("pen");
              }}
              className="grid size-11 place-items-center rounded-full border-2 border-white shadow-sm outline-offset-2"
              style={{ backgroundColor: value }}
            >
              {color === value && (
                <span className="rounded-full bg-white p-0.5 text-black">
                  <Check className="size-4" />
                </span>
              )}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          Độ dày
          <select
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
            className="min-h-11 rounded-lg border bg-card px-3"
          >
            {config.brushSizes.map((value) => (
              <option value={value} key={value}>
                {value} px
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            className="min-h-11"
            variant="outline"
            disabled={!count}
            onClick={() => {
              strokes.current = strokes.current.slice(0, -1);
              notify();
            }}
          >
            <Undo2 />
            Hoàn tác
          </Button>
          <Button
            className="min-h-11"
            variant="outline"
            disabled={!count}
            onClick={() => {
              strokes.current = [];
              notify();
            }}
          >
            <Trash2 />
            Xóa nét vẽ
          </Button>
        </div>
      </div>
      <p id={helpId} className="text-sm text-muted-foreground">
        Dùng chuột, ngón tay hoặc bút để vẽ lên hình. Tẩy chỉ xóa nét bạn đã vẽ.
      </p>
      <div
        className="relative isolate overflow-hidden rounded-2xl border-2 bg-white"
        style={{ aspectRatio: `${config.board.width}/${config.board.height}` }}
      >
        <img
          src={config.background.src}
          alt={config.background.alt}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-fill"
        />
        <canvas
          ref={canvas}
          aria-label="Bảng vẽ tự do trên hình"
          aria-describedby={helpId}
          className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0 || active.current)
              return;
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            active.current = {
              pointerId: event.pointerId,
              stroke: {
                tool,
                color,
                width: size / config.board.width,
                points: [
                  normalizedPoint(
                    event.clientX,
                    event.clientY,
                    event.currentTarget.getBoundingClientRect(),
                  ),
                ],
              },
            };
            schedule();
          }}
          onPointerMove={(event) => {
            if (!active.current || active.current.pointerId !== event.pointerId)
              return;
            const rect = event.currentTarget.getBoundingClientRect();
            const events = event.nativeEvent.getCoalescedEvents?.() ?? [];
            for (const point of events.length ? events : [event])
              active.current.stroke.points.push(
                normalizedPoint(point.clientX, point.clientY, rect),
              );
            schedule();
          }}
          onPointerUp={(event) => {
            finish(event.pointerId);
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={(event) => finish(event.pointerId, true)}
          onLostPointerCapture={(event) => finish(event.pointerId, true)}
        >
          Trình duyệt cần hỗ trợ Canvas để vẽ tự do.
        </canvas>
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        {count
          ? `${count} nét vẽ · Hãy sáng tạo theo cách của bạn.`
          : "Bức tranh đang chờ ý tưởng của bạn."}
      </p>
    </div>
  );
}
