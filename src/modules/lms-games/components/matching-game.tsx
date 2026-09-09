"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { makeCards, selectCard, shuffle } from "../logic";
import type { MatchingConfig, MatchingMode, MatchingState } from "../types";
import { GameContent } from "./game-content";

type Props = {
  config: MatchingConfig;
  onChange?: (state: MatchingState) => void;
  onComplete?: (state: MatchingState) => void;
};
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function MatchingGame(props: Props) {
  // Shuffle only after hydration, including when an admin config defaults to columns.
  const mounted = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  const [mode, setMode] = useState<MatchingMode>(props.config.defaultMode);
  const [round, setRound] = useState(0);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Cách ghép cặp"
        >
          {(
            [
              ["memory", "Lưới ghi nhớ"],
              ["columns", "Hai cột"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              className="min-h-11"
              variant={mode === value ? "default" : "outline"}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => setRound((value) => value + 1)}
        >
          <RotateCcw />
          Chơi lại
        </Button>
      </div>
      {mounted ? (
        <MatchingRound key={`${mode}:${round}`} {...props} mode={mode} />
      ) : (
        <p role="status" className="min-h-80 text-sm text-muted-foreground">
          Đang chuẩn bị bộ thẻ…
        </p>
      )}
    </div>
  );
}

function MatchingRound({
  config,
  mode,
  onChange,
  onComplete,
}: Props & { mode: MatchingMode }) {
  const cards = makeCards(config);
  const [state, setState] = useState<MatchingState>(() => ({
    order: shuffle(cards.map((card) => card.id)),
    selected: [],
    matched: [],
  }));
  const live = useRef(state);
  const [message, setMessage] = useState(
    mode === "memory"
      ? "Lật hai thẻ để tìm một cặp giống nhau."
      : "Chọn một hình ở mỗi cột để tìm cặp giống nhau.",
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const update = (next: MatchingState) => {
    live.current = next;
    setState(next);
    onChange?.(next);
  };
  const choose = (id: string) => {
    const previous = live.current;
    const card = cards.find((item) => item.id === id)!;
    if (
      mode === "columns" &&
      previous.selected.length === 1 &&
      cards.find((item) => item.id === previous.selected[0])?.side === card.side
    ) {
      if (!previous.matched.includes(card.pairId))
        update({ ...previous, selected: [id] });
      return;
    }
    const next = selectCard(previous, id, config);
    if (next === previous) return;
    update(next);
    if (next.matched.length > previous.matched.length) {
      const complete = next.matched.length === config.pairs.length;
      setMessage(
        complete
          ? "Đã tìm đủ các cặp. Hoàn thành!"
          : "Đúng cặp rồi! Tiếp tục khám phá nhé.",
      );
      if (complete) onComplete?.(next);
    } else if (next.selected.length === 2) {
      setMessage("Hai thẻ chưa cùng cặp. Thử lại nhé!");
      timer.current = setTimeout(() => {
        update({ ...live.current, selected: [] });
        timer.current = null;
      }, 800);
    } else setMessage("Chọn thêm một thẻ để so sánh.");
  };
  const renderCard = (id: string, index: number) => {
    const card = cards.find((item) => item.id === id)!;
    const matched = state.matched.includes(card.pairId);
    const selected = state.selected.includes(id);
    const visible = mode === "columns" || matched || selected;
    return (
      <button
        key={id}
        type="button"
        disabled={matched || state.selected.length === 2}
        aria-pressed={selected}
        aria-label={
          !visible
            ? `Lật thẻ ${index + 1}`
            : `${card.content.kind === "image" ? card.content.alt : card.content.text}${matched ? ", đã ghép" : ""}`
        }
        onClick={() => choose(id)}
        className={cn(
          "relative flex h-32 items-center justify-center rounded-2xl border-2 p-3 transition-colors sm:h-40",
          matched
            ? "border-success bg-success-soft"
            : selected
              ? "border-primary bg-secondary"
              : visible
                ? "border-border bg-card hover:border-primary"
                : "border-primary/20 bg-secondary hover:bg-accent",
        )}
      >
        {visible ? (
          <GameContent content={card.content} />
        ) : (
          <span className="flex flex-col items-center gap-2 text-primary">
            <Sparkles className="size-8" />
            <span className="text-xs font-medium">
              {String(index + 1).padStart(2, "0")}
            </span>
          </span>
        )}
        {matched && (
          <span className="absolute right-2 top-2 rounded-full bg-success p-1 text-white">
            <Check className="size-4" />
          </span>
        )}
      </button>
    );
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <p role="status">{message}</p>
        <span className="font-semibold text-primary">
          Đã ghép {state.matched.length}/{config.pairs.length} cặp
        </span>
      </div>
      {mode === "memory" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {state.order.map(renderCard)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-8">
          {(["left", "right"] as const).map((side) => (
            <div
              key={side}
              className="grid gap-3"
              aria-label={side === "left" ? "Cột trái" : "Cột phải"}
            >
              {state.order
                .filter(
                  (id) => cards.find((card) => card.id === id)?.side === side,
                )
                .map(renderCard)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
