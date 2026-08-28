"use client";

import { useEffect, useState } from "react";
import { mockSeed } from "@/modules/mock/mocks/seed";
import type { MockDatabase } from "@/modules/mock/types/mock";

const STORAGE_KEY = "buyback_mock_db_v1";

export function useMockDatabase() {
  const [data, setData] = useState<MockDatabase>(mockSeed);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) setData(JSON.parse(saved) as MockDatabase); } finally { setHydrated(true); } }, []);
  const update = (next: MockDatabase | ((current: MockDatabase) => MockDatabase)) => setData((current) => { const value = typeof next === "function" ? next(current) : next; localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); return value; });
  const reset = () => { localStorage.removeItem(STORAGE_KEY); setData(mockSeed); };
  return { data, update, reset, hydrated };
}
