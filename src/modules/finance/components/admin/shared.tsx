'use client';
import { useAuth } from '@/modules/auth/components/auth-provider';
import { z } from 'zod';

export const reasonFields = [{ name: 'reason', label: 'Lý do / ghi chú', type: 'textarea' as const }];

export const reasonSchema = z.object({ reason: z.string().trim().min(5, 'Nhập lý do ít nhất 5 ký tự') });

export function useSuperAdmin() { return useAuth().user?.role === 'SUPER_ADMIN'; }
