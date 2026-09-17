import { cn } from "@/lib/utils";
import * as React from "react";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "placeholder:text-muted-foreground/70 focus:border-ring focus:ring-ring/15 disabled:bg-muted h-11 w-full rounded-xl border bg-white px-3 text-base transition outline-none focus:ring-2 disabled:opacity-70 lg:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "placeholder:text-muted-foreground/70 focus:border-ring focus:ring-ring/15 disabled:bg-muted min-h-28 w-full resize-y rounded-xl border bg-white px-3 py-2.5 text-base transition outline-none focus:ring-2 disabled:opacity-70 lg:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "focus:border-ring focus:ring-ring/15 h-11 w-full rounded-xl border bg-white px-3 text-base transition outline-none focus:ring-2 lg:text-sm",
        className,
      )}
      {...props}
    />
  );
}
