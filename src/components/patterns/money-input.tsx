"use client";

import { Input } from "@/components/ui/input";
import { formatMoneyDigits, parseMoneyDigits } from "@/lib/money-input";
import { useRef, type ComponentProps } from "react";

type MoneyInputProps = Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
  allowNegative?: boolean;
};

export function MoneyInput({
  value,
  onValueChange,
  allowNegative = false,
  ...props
}: MoneyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Input
      {...props}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={formatMoneyDigits(value)}
      onChange={(event) => {
        const beforeCaret = event.currentTarget.value.slice(
          0,
          event.currentTarget.selectionStart ?? 0,
        );
        const digitsBeforeCaret = beforeCaret.replace(/\D/g, "").length;
        const next = parseMoneyDigits(event.currentTarget.value, allowNegative);
        onValueChange(next);
        requestAnimationFrame(() => {
          const input = inputRef.current;
          if (!input || document.activeElement !== input) return;
          const formatted = formatMoneyDigits(next);
          let caret = 0;
          let digits = 0;
          while (caret < formatted.length && digits < digitsBeforeCaret) {
            if (/\d/.test(formatted[caret])) digits++;
            caret++;
          }
          input.setSelectionRange(caret, caret);
        });
      }}
    />
  );
}
