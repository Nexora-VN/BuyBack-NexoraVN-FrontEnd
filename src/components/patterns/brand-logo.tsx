import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand-horizontal.svg"
      alt="Piggy Back"
      width={150}
      height={63}
      loading="eager"
      className={cn("h-auto object-contain", className)}
    />
  );
}
