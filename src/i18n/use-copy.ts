"use client";
import { useTranslations } from "next-intl";
import keys from "@/messages/copy-keys.json";

/** Keeps legacy field descriptors translatable while screens migrate to semantic keys. */
export function useCopy() {
  const translate = useTranslations("UI");
  return (source: string) => {
    const key = (keys as Record<string, string>)[source];
    return key ? translate(key) : source;
  };
}
