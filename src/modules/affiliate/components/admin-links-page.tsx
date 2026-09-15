"use client";
import { ResourceToolbar } from '@/components/patterns/resource-toolbar';
import { useConfirm } from '@/components/patterns/confirm-provider';
import { ListPagination } from '@/components/patterns/list-controls';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { useCopy } from '@/i18n/use-copy';
import { formatDateTime } from '@/lib/format';
import { useListState } from '@/lib/use-list-state';
import { useAffiliateLinks,useAffiliateMutations } from '@/modules/affiliate/hooks/use-affiliate';
import type { AffiliateLinkStatus } from '@/modules/affiliate/types/affiliate';
import { Failure,Loading } from '@/modules/finance/components/finance-ui';
import { Copy,Trash2 } from 'lucide-react';
import { toast } from 'sonner';
export function AdminLinksPage() {
  const t = useCopy(); const confirm = useConfirm(); const list = useListState('links');
  const status = ['WORKING', 'FAILED'].includes(list.status) ? list.status as AffiliateLinkStatus : undefined;
  const links = useAffiliateLinks({ page: list.page, limit: 20, sort: list.sort, ...(list.query ? { search: list.query } : {}), ...(status ? { affiliateLinkStatus: status } : {}) });
  const mutations = useAffiliateMutations();
  async function remove(id: string) {
    if (!await confirm(t('Xóa affiliate link này?'))) return;
    try { await mutations.remove.mutateAsync(id); toast.success(t('Đã xóa link')); }
    catch (error) { toast.error(t.error(error instanceof Error ? error.message : 'Không thể xóa link')); }
  }
  return <Page title={t("Quản lý Affiliate Links")} description="Danh sách liên kết mua sắm đã tạo.">
    <ResourceToolbar scope="links" label="Tìm Link ID, User ID, Product ID hoặc URL" states={['WORKING','FAILED']}/>
    {links.isLoading ? <Loading /> : links.isError ? <Failure message={links.error.message} retry={() => void links.refetch()} /> : <DataTable rows={links.data?.data ?? []} rowKey={row => row.id} columns={[
      { key: 'url', mobilePrimary: true, label: 'Link', render: row => <div className="min-w-0 max-w-80 break-all"><p>{row.cleanLink}</p><details className="mt-2 text-xs text-muted-foreground"><summary className="min-h-11 cursor-pointer">{t('Thông tin thêm')}</summary><p>{row.fullLinkSystem || row.longLink || row.shortLink || t('Chưa có link đầu ra')}</p><p>{row.id}</p></details></div> },
      { key: 'user', label: t("Người dùng"), render: row => <span className="break-all text-xs">{row.userId}</span> },
      { key: 'product', label: t("Sản phẩm"), render: row => <span className="break-all text-xs">{row.productId}</span> },
      { key: 'status', label: t("Trạng thái"), render: row => <Select aria-label={t('Trạng thái')} disabled={mutations.update.isPending} value={row.affiliateLinkStatus} onChange={async event => { try { await mutations.update.mutateAsync({ id: row.id, status: event.target.value as AffiliateLinkStatus }); toast.success(t('Đã lưu thay đổi')); } catch (error) { toast.error(t.error(error instanceof Error ? error.message : 'Không thể lưu')); } }}><option value="WORKING">{t('Hoạt động')}</option><option value="FAILED">{t('Thất bại')}</option></Select> },
      { key: 'date', label: t("Ngày tạo"), render: row => formatDateTime(row.createdAt) },
      { key: 'actions', label: t("Thao tác"), render: row => <div className="flex gap-2"><Button variant="outline" aria-label={t('Sao chép link')} onClick={async () => { try { await navigator.clipboard.writeText(row.fullLinkSystem || row.longLink || row.shortLink || row.cleanLink); toast.success(t('Đã sao chép')); } catch { toast.error(t.error('Không thể sao chép')); } }}><Copy />{t('Sao chép link')}</Button><Button variant="ghost" size="icon" aria-label={t('Xóa')} disabled={mutations.remove.isPending} onClick={() => void remove(row.id)}><Trash2 /></Button></div> },
    ]} />}
    {links.data && <ListPagination page={list.page} total={links.data.meta.total} totalPages={links.data.meta.totalPages} pending={links.isFetching} onPage={page => list.update({ page })} />}
  </Page>;
}
