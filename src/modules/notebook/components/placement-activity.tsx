"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Item = { id: string; label: string; targetId?: string };
type Config = { items?: Item[]; targets?: Item[]; order?: string[] };
export function PlacementActivity({ type, config, onComplete }: { type: string; config: unknown; onComplete: (result: Record<string, unknown>, score: number) => void }) {
  const data = config as Config;
  const items = data.items ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [order, setOrder] = useState(() => items.map(i => i.id));
  const [message, setMessage] = useState("");
  const place = (id: string, target: string) => { setPlacements(p => ({ ...p, [id]: target })); setSelected(null); };
  const check = () => {
    const score = type === "sort-order" ? Math.round(100 * order.filter((id, i) => id === data.order?.[i]).length / Math.max(items.length, 1)) : Math.round(100 * items.filter(i => placements[i.id] === i.targetId).length / Math.max(items.length, 1));
    setMessage(`${score}% chính xác`);
    onComplete(type === "sort-order" ? { order } : { placements: Object.entries(placements).map(([itemId, targetId]) => ({ itemId, targetId })) }, score);
  };
  return <section className="rounded-xl border bg-white p-4"><h3 className="font-bold">{type === "sort-order" ? "Sắp xếp thứ tự" : "Ghép vào nhóm"}</h3><p className="text-sm">Chọn mục rồi chọn đích, hoặc kéo thả.</p>
    {type === "sort-order" ? <ol className="my-3 space-y-2">{order.map((id, index) => <li key={id} className="flex items-center gap-2"><span className="flex-1">{items.find(i => i.id === id)?.label}</span>{[-1, 1].map(delta => <Button key={delta} variant="outline" disabled={index + delta < 0 || index + delta >= order.length} aria-label={`${delta < 0 ? "Lên" : "Xuống"} ${items.find(i => i.id === id)?.label}`} onClick={() => setOrder(previous => { const next = [...previous]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; return next; })}>{delta < 0 ? "↑" : "↓"}</Button>)}</li>)}</ol> : <><div className="my-3 flex flex-wrap gap-2">{items.map(i => <Button key={i.id} draggable variant={selected === i.id ? "default" : "outline"} onDragStart={e => e.dataTransfer.setData("text/plain", i.id)} onClick={() => setSelected(i.id)}>{i.label}</Button>)}</div><div className="grid gap-2">{(data.targets ?? []).map(t => <button key={t.id} className="rounded border-2 border-dashed p-3 text-left focus-visible:outline" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (items.some(i => i.id === id)) place(id, t.id); }} onClick={() => { if (selected) place(selected, t.id); }}><strong>{t.label}</strong><p>{items.filter(i => placements[i.id] === t.id).map(i => i.label).join(", ")}</p></button>)}</div></>}
    <div className="mt-3 flex gap-2"><Button onClick={check} disabled={!items.length}>Kiểm tra</Button><Button variant="outline" onClick={() => { setOrder(items.map(i => i.id)); setPlacements({}); setSelected(null); setMessage(""); }}>Làm lại</Button></div><p role="status">{message}</p></section>;
}
