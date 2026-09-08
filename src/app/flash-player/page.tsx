"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    RufflePlayer?: {
      newest?: () => { createPlayer: () => HTMLElement };
      config?: Record<string, unknown>;
      [key: string]: unknown;
    };
  }
}

function report(type: "OPENED" | "LOADED" | "ERROR", nonce: string, error?: string) {
  window.parent.postMessage({ source: "notebook-ruffle", type, nonce, error }, "*");
}

export default function FlashPlayerPage() {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const swfUrl = params.get("swf");
    const nonce = params.get("nonce") ?? "";
    if (!swfUrl || !nonce || !mount.current) return;
    const ruffle = (window.RufflePlayer = window.RufflePlayer ?? {});
    ruffle.config = {
      autoplay: "on",
      unmuteOverlay: "hidden",
      letterbox: "on",
      warnOnUnsupportedContent: false,
    };
    const script = document.createElement("script");
    script.src = "/ruffle/ruffle.js";
    script.onload = async () => {
      try {
        const player = window.RufflePlayer?.newest?.().createPlayer();
        if (!player) throw new Error("Ruffle could not create a player");
        player.style.width = "100%";
        player.style.height = "100%";
        mount.current?.replaceChildren(player);
        report("OPENED", nonce);
        await (player as HTMLElement & { load: (options: string | { url: string; allowScriptAccess?: boolean; autoplay?: string }) => Promise<void> }).load({
          url: swfUrl,
          allowScriptAccess: true,
          autoplay: "auto",
        });
        report("LOADED", nonce);
      } catch (error) {
        report("ERROR", nonce, error instanceof Error ? error.message : "Ruffle load failed");
      }
    };
    script.onerror = () => report("ERROR", nonce, "Ruffle script failed to load");
    document.head.appendChild(script);
    return () => script.remove();
  }, []);
  return <main ref={mount} className="fixed inset-0 size-full overflow-hidden bg-transparent" />;
}
