import { apiClient } from '@/lib/api/client';
import type { FinanceList } from '../types/finance';
export const financeService = {
  list: (path: string, page: number, status: string, search: string, sort: string) =>
    apiClient.get<FinanceList>('/api/backend/' + path, { params: { page, limit: 20, status, search, sort } }),
  get: <T>(path: string) => apiClient.get<T>('/api/backend/' + path),
  mutate: (path: string, body: unknown, method: 'post' | 'patch' | 'put' = 'post') =>
    apiClient[method]('/api/backend/' + path, body),
  remove: (path: string) => apiClient.delete('/api/backend/' + path),
};
