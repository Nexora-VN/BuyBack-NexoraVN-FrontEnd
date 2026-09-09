"use client";

import { useRef, useState } from "react";
import { Hand, Layers, Palette } from "lucide-react";
import { Page } from "@/components/ui/page";
import { cn } from "@/lib/utils";
import demoGames from "../demo-games.json";
import type { GameDefinition } from "../types";
import { MatchingGame } from "./matching-game";
import { DragGame } from "./drag-game";
import { DrawingGame } from "./drawing-game";

const games = demoGames as GameDefinition[];
const tabs = [
  { label: "Lật thẻ", icon: Layers },
  { label: "Kéo thả", icon: Hand },
  { label: "Vẽ tranh", icon: Palette },
];

export function GamesPage() {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const game = games[selected];
  return (
    <Page
      title="Game LMS"
      description="Chơi, khám phá và sáng tạo — những hoạt động nhỏ cho giờ học thêm thú vị."
      badge={
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          Góc trải nghiệm
        </span>
      }
    >
      <div
        className="grid grid-cols-3 gap-2 rounded-2xl border bg-card p-2 sm:gap-3"
        role="tablist"
        aria-label="Game dạy học"
      >
        {tabs.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            id={`game-tab-${index}`}
            type="button"
            role="tab"
            aria-controls="game-panel"
            aria-selected={selected === index}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowRight"
                  ? (index + 1) % tabs.length
                  : event.key === "ArrowLeft"
                    ? (index + tabs.length - 1) % tabs.length
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? tabs.length - 1
                        : null;
              if (next !== null) {
                event.preventDefault();
                setSelected(next);
                buttons.current[next]?.focus();
              }
            }}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-sm font-semibold transition-colors sm:flex-row sm:gap-3 sm:text-base",
              selected === index
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </div>
      <section
        id="game-panel"
        role="tabpanel"
        aria-labelledby={`game-tab-${selected}`}
        className="space-y-5 rounded-2xl border bg-card p-3 sm:p-6"
      >
        <header>
          <h2 className="text-xl font-bold sm:text-2xl">{game.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {game.instructions}
          </p>
        </header>
        {game.type === "matching" && (
          <MatchingGame
            key={`${game.id}:${game.version}`}
            config={game.config}
          />
        )}
        {game.type === "drag" && (
          <DragGame key={`${game.id}:${game.version}`} config={game.config} />
        )}
        {game.type === "drawing" && (
          <DrawingGame
            key={`${game.id}:${game.version}`}
            config={game.config}
          />
        )}
      </section>
    </Page>
  );
}
