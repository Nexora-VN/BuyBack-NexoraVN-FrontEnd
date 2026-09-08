"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  type: string;
  config: unknown;
  onComplete: (result: Record<string, unknown>, score: number) => void;
};
const record = (value: unknown) =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

export function CoreActivity({ type, config, onComplete }: Props) {
  const data = record(config);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const options = useMemo(
    () =>
      Array.isArray(data.options)
        ? data.options.filter(
            (item): item is Record<string, unknown> =>
              !!item && typeof item === "object",
          )
        : [],
    [data.options],
  );
  if (type === "multiple-choice")
    return (
      <section className="rounded-xl border bg-white p-4">
        <h3 className="font-bold">
          {String(data.question ?? "Chọn đáp án đúng")}
        </h3>
        <div className="mt-3 grid gap-2">
          {options.map((option, index) => (
            <Button
              key={String(option.id ?? index)}
              variant="outline"
              onClick={() => {
                const correct = option.correct === true;
                onComplete({ choice: option.id ?? index }, correct ? 100 : 0);
                setAnswer(correct ? "Đúng rồi!" : "Chưa đúng, thử lại.");
              }}
            >
              {String(option.label ?? option.text ?? `Đáp án ${index + 1}`)}
            </Button>
          ))}
        </div>
        {answer ? (
          <p className="mt-2 text-sm" aria-live="polite">
            {answer}
          </p>
        ) : null}
      </section>
    );
  if (type === "fill-blank")
    return (
      <section className="rounded-xl border bg-white p-4">
        <h3 className="font-bold">
          {String(data.prompt ?? "Điền vào chỗ trống")}
        </h3>
        <div className="mt-3 flex gap-2">
          <input
            aria-label="Câu trả lời"
            className="min-w-0 flex-1 rounded-md border px-3"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
          />
          <Button
            onClick={() => {
              const correct =
                String(data.answer ?? "")
                  .trim()
                  .toLowerCase() === answer.trim().toLowerCase();
              onComplete({ answer }, correct ? 100 : 0);
              setFeedback(correct ? "Đúng rồi!" : "Chưa đúng, thử lại.");
            }}
          >
            Kiểm tra
          </Button>
        </div>
        <p aria-live="polite">{feedback}</p>
      </section>
    );
  if (type === "reveal" || type === "flash-card")
    return (
      <section className="rounded-xl border bg-white p-4">
        <h3 className="font-bold">
          {String(
            data.title ?? (type === "reveal" ? "Khám phá" : "Flash card"),
          )}
        </h3>
        <Button
          className="mt-3"
          variant="outline"
          onClick={() => {
            setRevealed(!revealed);
            if (!revealed) onComplete({ revealed: true }, 100);
          }}
        >
          {revealed
            ? String(data.answer ?? data.back ?? "Đã mở")
            : String(data.prompt ?? data.front ?? "Bấm để mở")}
        </Button>
      </section>
    );
  return (
    <section className="rounded-xl border bg-white p-4">
      <h3 className="font-bold">{type}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Template này cần cấu hình items/targets trong Activity Studio.
      </p>
    </section>
  );
}
