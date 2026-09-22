'use client';
import { Button } from '@/components/ui/button';
import { useCopy } from '@/i18n/use-copy';
import { ApiError } from '@/lib/api/errors';
import { toast } from 'sonner';
export function ApiErrorNotice({ error }: { error: unknown }) {
  const t = useCopy();
  if (!error) return null;
  const id = error instanceof ApiError ? error.requestId : undefined;
  return <div role="alert" className="text-danger text-sm"><p>{t.error(error instanceof Error ? error.message : 'Không thể xử lý yêu cầu.')}</p>{id && <Button type="button" variant="ghost" size="sm" onClick={() => { void navigator.clipboard.writeText(id).then(() => toast.success(t('Đã sao chép')), () => toast.error(t('Không thể sao chép'))); }}>Mã tra lỗi: {id}</Button>}</div>;
}
