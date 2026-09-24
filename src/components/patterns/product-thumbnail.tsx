"use client";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import { useCopy } from "@/i18n/use-copy";
export function ProductThumbnail({
  src,
  name,
  className = "size-12",
}: {
  src?: string | null;
  name: string;
  className?: string;
}) {
  return <Thumbnail key={src} src={src} name={name} className={className} />;
}
function Thumbnail({
  src,
  name,
  className,
}: {
  src?: string | null;
  name: string;
  className: string;
}) {
  const t = useCopy();
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={`bg-muted border border-border/50 grid shrink-0 place-items-center overflow-hidden rounded-xl ${className}`}
    >
      {src && !failed ? (
        // Provider image hosts vary; native loading allows an explicit fallback.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <ImageOff aria-label={t("Chưa có ảnh sản phẩm")} className="text-muted-foreground/60 size-5" />
      )}
    </span>
  );
}
