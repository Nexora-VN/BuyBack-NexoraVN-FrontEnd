import { cn } from "@/lib/utils";

export function SkeletonBlock({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("skeleton block rounded-lg", className)} />;
}
