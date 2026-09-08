'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance';
export function useFinance<T>(path: string) {
  return useQuery({ queryKey: ['finance', path], queryFn: () => financeService.get<T>(path), refetchInterval: 30000 });
}
export function useFinanceList(path: string, page: number, status: string, search: string, sort: string) {
  return useQuery({ queryKey: ['finance', path, page, status, search, sort],
    queryFn: () => financeService.list(path, page, status, search, sort), refetchInterval: 15000 });
}
export function useRefreshFinance() {
  const query = useQueryClient();
  return () => query.invalidateQueries({ queryKey: ['finance'] });
}
