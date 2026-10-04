import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandAvatar({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      width={512}
      height={512}
      alt=""
      aria-hidden="true"
      className={cn("object-contain", className)}
    />
  );
}
