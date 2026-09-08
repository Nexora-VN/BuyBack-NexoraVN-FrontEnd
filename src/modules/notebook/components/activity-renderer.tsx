"use client";

import { Puzzle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MatchingActivity } from "./matching-activity";
import { CoreActivity } from "./core-activities";
import { PlacementActivity } from "./placement-activity";
import { RuffleActivity } from "./ruffle-activity";
import type { NotebookActivity } from "../types";

export function ActivityRenderer({ activity, onComplete }: { activity: NotebookActivity; onComplete: (result: Record<string, unknown>, score: number) => void }) {
  const [retry, setRetry] = useState(false);
  if (activity.latestAttempt && !retry) return <section className="rounded-xl border bg-white p-4"><h3 className="font-bold">Kết quả đã lưu: {activity.latestAttempt.score}%</h3><p>{activity.latestAttempt.completedAt ? 'Đã hoàn thành' : 'Có thể làm lại để cải thiện kết quả'}</p><Button onClick={() => setRetry(true)}>Làm lại bài</Button></section>;
  const mode = activity.rendererMode ?? activity.definition?.rendererMode ?? "AUTO";
  if (mode === "DISABLED") return <section className="flex h-full min-h-28 items-center gap-3 rounded-xl border border-dashed bg-muted p-4"><Puzzle className="size-7 shrink-0"/><div><h3 className="font-semibold">Hoạt động đã tắt</h3><p className="mt-1 text-sm">Giáo viên chưa cho phép chạy nội dung này.</p></div></section>;
  if (mode === "RUFFLE" || mode === "AUTO" || activity.runtimeProfile) return <RuffleActivity activity={activity} />;
  if (activity.status === "READY" && activity.definition && ["drag-drop", "sort-order"].includes(activity.definition.type)) return <PlacementActivity key={`${activity.id}:${activity.definition.version}`} type={activity.definition.type} config={activity.definition.config} onComplete={onComplete} />;
  if (activity.status === "READY" && activity.definition?.type === "matching-select") return <MatchingActivity activityId={activity.id} config={activity.definition.config} onComplete={onComplete} />;
  if (activity.status === "READY" && activity.definition && ["multiple-choice", "fill-blank", "reveal", "flash-card", "sort-order", "drag-drop"].includes(activity.definition.type)) return <CoreActivity type={activity.definition.type} config={activity.definition.config} onComplete={onComplete} />;
  return <section className="flex h-full min-h-28 items-center gap-3 rounded-xl border border-dashed bg-amber-50 p-4 text-amber-950"><Puzzle className="size-7 shrink-0"/><div><h3 className="font-semibold">Hoạt động đang chờ chuyển đổi</h3><p className="mt-1 text-sm">Nội dung Flash cũ không được chạy trên trình duyệt. Admin có thể chọn renderer phù hợp trong Activity review.</p></div></section>;
}
