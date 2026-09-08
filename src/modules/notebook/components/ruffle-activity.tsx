"use client";

import { AlertCircle, LoaderCircle, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { notebookService } from "../notebook.service";
import type { NotebookActivity } from "../types";

type Session = { sessionId: string; nonce: string; expiresAt: string; swfUrl: string };
export function RuffleActivity({ activity }: { activity: NotebookActivity }) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const createSession = useCallback(() => notebookService.flashSession(activity.id).then(setSession).catch((reason: Error) => setError(reason.message)), [activity.id]);
  useEffect(() => { void createSession(); }, [createSession]);
  useEffect(() => {
    if (!session) return;
    const receive = (message: MessageEvent) => {
      const event = message.data as { source?: string; type?: "OPENED" | "LOADED" | "ERROR"; nonce?: string; error?: string };
      if (event.source !== "notebook-ruffle" || event.nonce !== session.nonce || !event.type) return;
      if (event.type === "ERROR") { setError(event.error ?? "Ruffle không thể chạy game này"); void notebookService.flashEvent(activity.id, session.sessionId, "ERROR", event.error); return; }
      if (event.type === "LOADED") setLoaded(true);
      void notebookService.flashEvent(activity.id, session.sessionId, event.type);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [activity.id, session]);
  useEffect(() => {
    if (!session || !loaded) return;
    const id = window.setInterval(() => void notebookService.flashEvent(activity.id, session.sessionId, "HEARTBEAT"), 15_000);
    return () => window.clearInterval(id);
  }, [activity.id, loaded, session]);
  if (error) return <section className="flex h-full min-h-28 items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950"><AlertCircle className="size-6"/><div><strong>Game Flash chưa chạy được</strong><p className="text-sm">{error}</p><Button size="sm" variant="outline" className="mt-2" onClick={() => { setError(""); setLoaded(false); void createSession(); }}><RotateCcw/>Thử lại</Button></div></section>;
  if (!session) return <div className="grid size-full min-h-28 place-items-center rounded-xl border bg-white"><LoaderCircle className="animate-spin"/><span className="sr-only">Đang chuẩn bị Flash game</span></div>;
  const src = `/flash-player?nonce=${encodeURIComponent(session.nonce)}&swf=${encodeURIComponent(session.swfUrl)}`;
  return <iframe title={`Flash activity ${activity.sourcePath}`} src={src} sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" className="size-full rounded-xl border-0 bg-transparent" />;
}
