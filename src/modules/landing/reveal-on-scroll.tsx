"use client";

import { useEffect } from "react";

export function RevealOnScroll() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-landing-motion]");
    if (!root || !("IntersectionObserver" in window)) return;

    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "visible";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    root.dataset.motionReady = "true";

    return () => {
      observer.disconnect();
      delete root.dataset.motionReady;
    };
  }, []);

  return null;
}
