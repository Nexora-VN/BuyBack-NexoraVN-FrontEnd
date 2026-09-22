"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { financeService } from "../services/finance";
export function useFinance<T>(path: string) {
  return useQuery({
    queryKey: ["finance", path],
    queryFn: () => financeService.get<T>(path),
    staleTime: 60_000,
  });
}
export function useFinanceList(
  path: string,
  page: number,
  status: string,
  search: string,
  sort: string,
) {
  return useQuery({
    queryKey: ["finance", path, page, status, search, sort],
    queryFn: () => financeService.list(path, page, status, search, sort),
    refetchInterval: (query) =>
      path.includes("batches") &&
      query.state.data?.data.some((row) => ["QUEUED", "RUNNING"].includes(String(row.status)))
        ? 15000
        : false,
    refetchIntervalInBackground: false,
    staleTime: 60_000,
  });
}
export function useRefreshFinance() {
  const query = useQueryClient();
  return () => query.invalidateQueries({ queryKey: ["finance"] });
}
