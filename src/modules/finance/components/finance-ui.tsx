'use client';
import { useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Input, Select, Textarea } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/page';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatVnd, formatDateTime } from '@/lib/format';
import { useFinanceList, useRefreshFinance } from '../hooks/use-finance';
import { financeService } from '../services/finance';
import type { Field, FinanceRow } from '../types/finance';

export function read(row: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, part) => value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined, row);
}
export const text = (row: unknown, path: string) => { const v = read(row, path); return v === null || v === undefined ? '—' : String(v); };
export function columns(specs: [string, string, ('money' | 'status' | 'date')?][]): Column<FinanceRow>[] {
  return specs.map(([key, label, type]) => ({ key, label, render: row => {
    const value = text(row, key);
    if (value === '—') return value;
    if (type === 'money') return <span className="whitespace-nowrap tabular-nums">{formatVnd(value)}</span>;
    if (type === 'status') return <StatusBadge status={value} />;
    if (type === 'date') return formatDateTime(value);
    return <span className="block max-w-72 break-words">{value}</span>;
  } }));
}
export function Loading() { return <div role="status" aria-label="Đang tải" className="skeleton h-48 rounded-2xl" />; }
export function Failure({ message, retry }: { message: string; retry: () => void }) {
  return <Card role="alert"><p className="text-danger">{message}</p><Button variant="outline" className="mt-3" onClick={retry}>Thử lại</Button></Card>;
}
export function FinanceTable({ path, specs, states, actions, searchLabel = 'Tìm kiếm', extraColumns = [] }: {
  path: string; specs: [string, string, ('money' | 'status' | 'date')?][]; states?: string[];
  actions?: (row: FinanceRow) => ReactNode; searchLabel?: string; extraColumns?: Column<FinanceRow>[];
}) {
  const [page, setPage] = useState(1), [status, setStatus] = useState(''), [search, setSearch] = useState(''), [draft, setDraft] = useState(''), [sort, setSort] = useState('desc');
  const query = useFinanceList(path, page, status, search, sort);
  const cols = [...extraColumns, ...columns(specs), ...(actions ? [{ key: 'actions', label: 'Thao tác', render: actions }] : [])];
  return <div className="min-w-0 space-y-4">
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={e => { e.preventDefault(); setSearch(draft); setPage(1); }}>
      <Input aria-label={searchLabel} placeholder={searchLabel} value={draft} onChange={e => setDraft(e.target.value)} />
      {states && <Select aria-label="Trạng thái" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">Tất cả trạng thái</option>{states.map(s => <option key={s}>{s}</option>)}</Select>}
      <Select aria-label="Sắp xếp" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="desc">Mới nhất</option><option value="asc">Cũ nhất</option></Select>
      <Button type="submit" variant="outline">Tìm</Button>
    </form>
    {query.isLoading ? <Loading /> : query.isError ? <Failure message={query.error.message} retry={() => void query.refetch()} /> :
      !query.data?.data.length ? <EmptyState title="Chưa có dữ liệu" description="Dữ liệu sẽ xuất hiện sau khi hệ thống ghi nhận hoặc đồng bộ giao dịch." /> :
      <DataTable columns={cols} rows={query.data.data} rowKey={r => r.id} />}
    {query.data && <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>{query.data.meta.total} bản ghi · Trang {page}/{Math.max(1, query.data.meta.totalPages)}</span><div className="flex gap-2"><Button variant="outline" disabled={page <= 1 || query.isFetching} onClick={() => setPage(p => p - 1)}>Trước</Button><Button variant="outline" disabled={page >= query.data.meta.totalPages || query.isFetching} onClick={() => setPage(p => p + 1)}>Sau</Button></div></div>}
  </div>;
}
export function MutationForm({ title, fields, path, method = 'post', schema, transform, confirmation = true, children, onSuccess }: {
  title: string; fields: Field[]; path: string; method?: 'post' | 'put' | 'patch';
  schema?: z.ZodType; transform?: (input: Record<string, string>) => unknown; confirmation?: boolean; children?: ReactNode; onSuccess?: () => void;
}) {
  const refresh = useRefreshFinance();
  const [values, setValues] = useState<Record<string, string>>({}), [error, setError] = useState(''), [pending, setPending] = useState(false), [confirm, setConfirm] = useState(false);
  async function send() {
    setPending(true); setError('');
    try {
      await financeService.mutate(path, transform ? transform(values) : values, method);
      setValues({}); setConfirm(false); await refresh(); onSuccess?.(); toast.success('Đã lưu thay đổi');
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể lưu'); }
    finally { setPending(false); }
  }
  return <Card><form className="space-y-4" onSubmit={e => {
    e.preventDefault(); const result = schema?.safeParse(values);
    if (result && !result.success) { setError(result.error.issues.map(i => i.message).join(' · ')); return; }
    if (confirmation) setConfirm(true); else void send();
  }}><h2 className="text-lg font-semibold">{title}</h2>{children}
    <div className="grid gap-4 sm:grid-cols-2">{fields.map(field => <label key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
      <span className="mb-1 block text-sm font-medium">{field.label}</span>
      {field.type === 'textarea' ? <Textarea required={field.required !== false} value={values[field.name] ?? ''} onChange={e => setValues(v => ({ ...v, [field.name]: e.target.value }))} /> :
        <Input type={field.type ?? 'text'} required={field.required !== false} autoComplete={field.type === 'password' ? 'off' : undefined} value={values[field.name] ?? ''} onChange={e => setValues(v => ({ ...v, [field.name]: e.target.value }))} />}
      {field.help && <span className="mt-1 block text-xs text-muted-foreground">{field.help}</span>}
    </label>)}</div>{error && <p role="alert" className="text-sm text-danger">{error}</p>}<Button disabled={pending} type="submit">{pending ? 'Đang xử lý…' : title}</Button>
  </form><Dialog.Root open={confirm} onOpenChange={v => { if (!pending) setConfirm(v); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
    <Dialog.Title className="font-semibold">Xác nhận {title.toLowerCase()}</Dialog.Title><Dialog.Description className="mt-2 text-sm text-muted-foreground">Kiểm tra thông tin đã nhập. Thao tác này sẽ được lưu vào lịch sử hệ thống.</Dialog.Description>
    <dl className="mt-4 max-h-48 space-y-2 overflow-y-auto text-sm">{fields.map(field => <div key={field.name}><dt className="text-muted-foreground">{field.label}</dt><dd className="break-words font-medium">{field.type === 'password' ? '••••••••' : values[field.name] || '—'}</dd></div>)}</dl>
    {error && <p role="alert" className="mt-3 text-danger">{error}</p>}<div className="mt-5 flex justify-end gap-3"><Button variant="outline" disabled={pending} onClick={() => setConfirm(false)}>Quay lại</Button><Button disabled={pending} onClick={() => void send()}>{pending ? 'Đang xử lý…' : 'Xác nhận'}</Button></div>
  </Dialog.Content></Dialog.Portal></Dialog.Root></Card>;
}
export function ActionDialog({ label, children }: { label: string; children: ReactNode }) {
  return <Dialog.Root><Dialog.Trigger asChild><Button variant="outline" size="sm">{label}</Button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-black/30" /><Dialog.Content className="fixed left-1/2 top-1/2 z-40 max-h-[85vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
    <Dialog.Title className="mb-3 text-lg font-semibold">{label}</Dialog.Title><Dialog.Description className="sr-only">Nhập và xác nhận thông tin thao tác.</Dialog.Description>{children}<Dialog.Close asChild><Button variant="outline" className="mt-3">Đóng</Button></Dialog.Close>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
