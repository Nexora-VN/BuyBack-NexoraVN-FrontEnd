"use client";

import { useSyncExternalStore } from "react";
import { consentEvent, readAnalyticsChoice } from "./analytics";

function subscribe(callback: () => void) {
  window.addEventListener(consentEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(consentEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useAnalyticsChoice() {
  return useSyncExternalStore(subscribe, readAnalyticsChoice, () => undefined);
}
