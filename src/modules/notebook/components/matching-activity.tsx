"use client";
/* eslint-disable @next/next/no-img-element */

import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Pair = { id: string; left: string; right: string; audioUrl?: string; imageUrl?: string };
type Props = { activityId: string; config: unknown; onComplete: (result: Record<string, unknown>, score: number) => void };

function pairsFrom(config: unknown): Pair[] {
  if (!config || typeof config !== "object" || !("pairs" in config) || !Array.isArray((config as { pairs: unknown }).pairs)) return [];
  return (config as { pairs: Pair[] }).pairs.filter((pair) => pair?.id && pair.left && pair.right);
}

export function MatchingActivity({ config, onComplete }: Props) {
  const pairs = useMemo(() => pairsFrom(config), [config]);
  const [left, setLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [message, setMessage] = useState("Chọn một mục ở mỗi cột để ghép cặp.");
  const chooseRight = (id: string) => { if (!left) { setMessage("Hãy chọn một mục ở cột bên trái trước."); return; } if (left === id) { const next = [...matched, id]; setMatched(next); setLeft(null); if (next.length === pairs.length) { setMessage("Hoàn thành xuất sắc!"); onComplete({ pairs: next.map(value => ({ left: value, right: value })) }, 100); } else setMessage("Đúng rồi, tiếp tục nhé."); } else { setMessage("Chưa đúng, thử một cặp khác."); setLeft(null); } };
  const reset = () => { setLeft(null); setMatched([]); setMessage("Chọn một mục ở mỗi cột để ghép cặp."); };
  if (!pairs.length) return <p className="p-4 text-sm text-muted-foreground">Activity config chưa có dữ liệu pairs.</p>;
  return <section className="rounded-xl border bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">Matching game</h3><p className="mt-1 text-sm text-muted-foreground" aria-live="polite">{message}</p></div><Button variant="ghost" size="sm" onClick={reset}><RotateCcw/>Làm lại</Button></div>
    <div className="mt-4 grid grid-cols-2 gap-3">{pairs.map((pair) => <Button key={pair.id} variant={left === pair.id ? "default" : "outline"} className="h-auto min-h-12 whitespace-normal" disabled={matched.includes(pair.id)} onClick={() => { setLeft(pair.id); if (pair.audioUrl) void new Audio(pair.audioUrl).play(); }}>{pair.imageUrl ? <img src={pair.imageUrl} alt="" className="size-8 object-contain"/> : null}{pair.left}</Button>)}
      {pairs.map((pair) => <Button key={`right-${pair.id}`} variant="outline" className="h-auto min-h-12 whitespace-normal" disabled={matched.includes(pair.id)} onClick={() => chooseRight(pair.id)}>{pair.right}</Button>)}</div>
    <p className="mt-3 text-xs font-medium text-primary">Đã ghép: {matched.length}/{pairs.length}</p>
  </section>;
}
