/* eslint-disable @next/next/no-img-element */
import type { GameContent as Content } from "../types";

export function GameContent({ content }: { content: Content }) {
  return content.kind === "image" ? (
    <img
      src={content.src}
      alt={content.alt}
      draggable={false}
      className="h-full max-h-36 w-full select-none object-contain"
    />
  ) : (
    <span className="break-words text-sm font-semibold sm:text-lg">
      {content.text}
    </span>
  );
}
