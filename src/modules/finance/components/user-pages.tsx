'use client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';
import { Page } from '@/components/ui/page';
import { Card, StatCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatVnd, formatDateTime } from '@/lib/format';
import { useAuth } from '@/modules/auth/components/auth-provider';
import { useFinance, useRefreshFinance } from '../hooks/use-finance';
import { financeService } from '../services/finance';
import { bankSchema, withdrawalSchema } from '../schemas/finance';
import type { Dashboard, FinanceList, FinanceRow } from '../types/finance';
import { ActionDialog, Failure, FinanceTable, Loading, MutationForm, read, text } from './finance-ui';

export const orderSpecs: [string, string, ('money' | 'status' | 'date')?][] = [
  ['orderSn', 'Mã đơn'], ['checkout.purchasedAt', 'Ngày mua', 'date'],
  ['checkout.conversionState', 'Chuyển đổi', 'status'], ['checkout.commission.state', 'Hoa hồng', 'status'],
  ['checkout.commission.cashback.userAmount', 'Cashback', 'money'],
];
export function DashboardContent({ admin = false }: { admin?: boolean }) {
  const query = useFinance<Dashboard>(admin ? 'admin/dashboard' : 'me/dashboard');
  if (query.isLoading) return <Loading />;
  if (query.isError) return <Failure message={query.error.message} retry={() => void query.refetch()} />;
  if (!query.data) return null;
  const data = query.data;
  return <><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Đơn đã ghi nhận" value={data.orders} /><StatCard label="Khả dụng" value={formatVnd(data.wallet.available)} /><StatCard label="Đang giữ cho yêu cầu rút" value={formatVnd(data.wallet.reserved)} /></div>
    <Card><h2 className="font-semibold">Trạng thái hoa hồng</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.commissions.map(c => <div className="rounded-xl border p-4" key={c.state}><StatusBadge status={c.state} /><p className="mt-3">{c._count} chuyển đổi</p><p className="mt-1 text-sm text-muted-foreground">Đối soát: {formatVnd(c._sum.estimatedVnd ?? '0')}</p><p className="text-sm">Đã quyết toán: {formatVnd(c._sum.settledVnd ?? '0')}</p></div>)}</div>{!data.commissions.length && <p className="mt-3 text-muted-foreground">Chưa có chuyển đổi được ghi nhận.</p>}</Card></>;
}
export function UserDashboardPage() {
  return <Page title="Tổng quan cashback" description="Số liệu từ đơn hàng đã ghi nhận và ví của bạn." actions={<Button asChild><Link href="/app/links/new">Tạo link</Link></Button>}><DashboardContent /><Card>Cashback đã xác thực sẽ khả dụng sau khi BuyBack xác nhận nhận được hoa hồng từ Shopee.</Card></Page>;
}
export function LinkHistoryPage() {
  return <Page title="Link của tôi" actions={<Button asChild><Link href="/app/links/new">Tạo link mới</Link></Button>}><FinanceTable path="me/affiliate-links" searchLabel="Tìm URL gốc" specs={[['product.productName', 'Sản phẩm'], ['affiliateLinkStatus', 'Trạng thái', 'status'], ['createdAt', 'Ngày tạo', 'date']]}
    actions={row => <Button variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(text(row, 'fullLinkSystem')).then(() => toast.success('Đã sao chép')).catch(() => toast.error('Không thể sao chép'))}>Sao chép link</Button>} /></Page>;
}
export function UserOrdersPage() {
  return <Page title="Đơn hàng của tôi" description="Chỉ hiển thị đơn đã được gắn đúng tài khoản của bạn."><FinanceTable path="me/orders" searchLabel="Mã đơn Shopee" states={['1', '2', '3', '4']} specs={orderSpecs} actions={row => <Link className="text-primary underline" href={'/app/orders/' + row.id}>Chi tiết</Link>} /></Page>;
}
export function UserOrderDetailPage({ id, admin = false }: { id: string; admin?: boolean }) {
  const query = useFinance<FinanceRow>((admin ? 'admin/' : 'me/') + 'orders/' + id);
  return <Page title="Chi tiết đơn hàng">{query.isLoading ? <Loading /> : query.isError ? <Failure message={query.error.message} retry={() => void query.refetch()} /> : query.data && <>
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-lg">{text(query.data, 'orderSn')}</h2>
        {admin && <span className="text-sm font-mono text-muted-foreground">{text(query.data, 'provider')}</span>}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <StatusBadge status={text(query.data, 'checkout.conversionState')} />
        <StatusBadge status={text(query.data, 'checkout.commission.state')} />
      </div>
      <p className="mt-4">Cashback dự kiến: <strong>{formatVnd(text(query.data, 'checkout.commission.cashback.userAmount') === '—' ? '0' : text(query.data, 'checkout.commission.cashback.userAmount'))}</strong></p>
      {admin && (
        <p className="mt-1 text-sm text-muted-foreground">
          Hoa hồng đối soát (VND): <strong>{formatVnd(text(query.data, 'checkout.commission.estimatedVnd') === '—' ? '0' : text(query.data, 'checkout.commission.estimatedVnd'))}</strong>
        </p>
      )}
      <p className="mt-2 text-sm text-muted-foreground">Ngày mua: {formatDateTime(text(query.data, 'checkout.purchasedAt'))}</p>
      {admin && text(query.data, 'checkout.utmContent') !== '—' && (
        <div className="mt-3 rounded-lg bg-muted/60 p-3 text-xs">
          <p className="font-semibold text-muted-foreground">Attribution UTM:</p>
          <p className="font-mono break-all mt-1">{text(query.data, 'checkout.utmContent')}</p>
        </div>
      )}
    </Card>

    {admin && query.data.settlementEligibility && (
      <Card>
        <h2 className="font-semibold">Điều kiện thanh toán (Settlement)</h2>
        <div className="mt-3">
          {(query.data.settlementEligibility as { eligible: boolean; blockers: string[] }).eligible ? (
            <div className="rounded-lg bg-success-soft p-3 text-sm text-success font-semibold">
              ✓ Đơn hàng đủ điều kiện đưa vào kỳ thanh toán settlement.
            </div>
          ) : (
            <div className="rounded-lg bg-danger-soft p-3 text-sm text-danger space-y-1">
              <p className="font-semibold">Chưa đủ điều kiện thanh toán. Các lý do chặn:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                {(query.data.settlementEligibility as { eligible: boolean; blockers: string[] }).blockers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    )}

    <Card>
      <h2 className="font-semibold">Sản phẩm trong đơn</h2>
      <div className="mt-4 space-y-3">
        {(read(query.data, 'items') as FinanceRow[] ?? []).map(item => {
          const itemScale = text(item, 'scale') === '100000' ? 100000n : 1n;
          const rawAmount = text(item, 'actualAmountRaw');
          const actualAmountVnd = rawAmount === '—' ? 0n : BigInt(rawAmount) / itemScale;
          return (
            <div key={item.id} className="rounded-xl border p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{text(item, 'itemName') === '—' ? text(item, 'payload.item_name') : text(item, 'itemName')}</p>
                <div className="flex gap-2">
                  <StatusBadge status={text(item, 'status')} />
                  {text(item, 'commissionStatus') !== '—' && (
                    <span className="text-xs rounded px-2 py-0.5 bg-muted text-muted-foreground">{text(item, 'commissionStatus')}</span>
                  )}
                </div>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-3">
                <p>Giá trị mua: <strong>{formatVnd(actualAmountVnd)}</strong></p>
                {admin && text(item, 'commissionVnd') !== '—' && (
                  <p>Hoa hồng: <strong>{formatVnd(text(item, 'commissionVnd'))}</strong></p>
                )}
                {admin && text(item, 'mcnFeeVnd') !== '—' && BigInt(text(item, 'mcnFeeVnd') === '—' ? '0' : text(item, 'mcnFeeVnd')) !== 0n && (
                  <p className="text-warning">Phí MCN: <strong>{formatVnd(text(item, 'mcnFeeVnd'))}</strong></p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  </>}</Page>;
}
export function CashbackPage() {
  return <Page title="Cashback" description="Số tiền VALIDATED còn chờ xác nhận kỳ thanh toán, chưa thể rút."><FinanceTable path="me/cashbacks" searchLabel="Mã checkout Shopee" states={['PENDING','VALIDATED','AVAILABLE','REJECTED','REVERSED']} specs={[['commission.id','Mã hoa hồng'],['userAmount','Cashback','money'],['state','Trạng thái','status'],['createdAt','Ghi nhận','date']]} /></Page>;
}
export function WalletPage() {
  const wallet = useFinance<{ available: string; reserved: string }>('me/wallet');
  return <Page title="Ví của tôi" actions={<Button asChild><Link href="/app/withdrawals/new">Yêu cầu rút</Link></Button>}>
    {wallet.isLoading ? <Loading /> : wallet.isError ? <Failure message={wallet.error.message} retry={() => void wallet.refetch()} /> : wallet.data && <div className="grid gap-4 sm:grid-cols-2"><StatCard label="Khả dụng" value={formatVnd(wallet.data.available)} /><StatCard label="Đang giữ" value={formatVnd(wallet.data.reserved)} /></div>}
    {wallet.data && BigInt(wallet.data.available) < 0n && <Card role="alert">Ví đang có khoản hoàn trả sau điều chỉnh đơn hàng. Bạn có thể rút tiếp khi số dư khả dụng đủ mức tối thiểu.</Card>}
    <FinanceTable path="me/wallet/transactions" searchLabel="Mã tham chiếu" specs={[['type','Loại giao dịch'],['availableDelta','Thay đổi khả dụng','money'],['reservedDelta','Thay đổi đang giữ','money'],['availableAfter','Khả dụng sau giao dịch','money'],['createdAt','Thời gian','date']]} />
  </Page>;
}
export function NewWithdrawalPage() {
  const banks = useFinance<FinanceList>('me/bank-accounts?status=APPROVED&limit=100');
  const wallet = useFinance<{ available: string }>('me/wallet');
  const [amount, setAmount] = useState(''), [bankId, setBank] = useState(''), [pending, setPending] = useState(false);
  const key = useRef<string | null>(null);
  const refresh = useRefreshFinance();
  async function submit() {
    const result = withdrawalSchema.safeParse({ amount, bankId });
    if (!result.success) { toast.error(result.error.issues.map(i => i.message).join(' · ')); return; }
    if (wallet.data && BigInt(amount) > BigInt(wallet.data.available)) { toast.error('Số dư khả dụng không đủ'); return; }
    setPending(true);
    key.current ??= crypto.randomUUID();
    try { await financeService.mutate('me/withdrawals', { amount, bankId, idempotencyKey: key.current }); key.current = null; setAmount(''); await refresh(); toast.success('Đã gửi yêu cầu rút và giữ số tiền tương ứng'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Không thể tạo yêu cầu'); } finally { setPending(false); }
  }
  return <Page title="Yêu cầu rút tiền" description="Tối thiểu 50.000 VND. Admin chuyển khoản thủ công, số tiền được giữ ngay khi gửi yêu cầu.">
    {banks.isError ? <Failure message={banks.error.message} retry={() => void banks.refetch()} /> : <Card className="max-w-2xl"><form className="space-y-5" onSubmit={e => { e.preventDefault(); void submit(); }}>
      <p>Khả dụng: {wallet.data ? formatVnd(wallet.data.available) : 'Đang tải…'}</p>
      <label className="block">Số tiền (VND)<Input inputMode="numeric" required value={amount} onChange={e => { setAmount(e.target.value); key.current = null; }} /></label>
      <label className="block">Tài khoản đã duyệt<Select required value={bankId} onChange={e => { setBank(e.target.value); key.current = null; }}><option value="">Chọn tài khoản</option>{banks.data?.data.map(b => <option key={b.id} value={b.id}>{text(b,'bankName')} · ****{text(b,'lastFour')} · {text(b,'accountHolder')}</option>)}</Select></label>
      {!banks.isLoading && !banks.data?.data.length && <p>Chưa có tài khoản được duyệt. <Link href="/app/account" className="text-primary underline">Thêm tài khoản ngân hàng</Link></p>}
      <Button disabled={pending || !bankId || !wallet.data}>{pending ? 'Đang gửi…' : 'Gửi yêu cầu rút'}</Button>
    </form></Card>}
  </Page>;
}
export function WithdrawalHistoryPage() {
  return <Page title="Lịch sử rút tiền"><FinanceTable path="me/withdrawals" searchLabel="Mã chuyển khoản" states={['PENDING','PROCESSING','COMPLETED','REJECTED','FAILED']} specs={[['id','Mã yêu cầu'],['amount','Số tiền','money'],['bank.bankName','Ngân hàng'],['bank.lastFour','4 số cuối'],['status','Trạng thái','status'],['createdAt','Ngày tạo','date']]} /></Page>;
}
export const bankFields = [{ name:'bankCode', label:'Mã ngân hàng' },{ name:'bankName', label:'Tên ngân hàng' },{ name:'accountHolder', label:'Tên chủ tài khoản' },{ name:'accountNumber', label:'Số tài khoản' }];
export function AccountPage() {
  const { user } = useAuth();
  const refresh = useRefreshFinance();
  return <Page title="Tài khoản của tôi"><Card><h2 className="font-semibold">{user?.email}</h2><p className="mt-2 text-sm text-muted-foreground">Thông tin tài khoản thanh toán được mã hóa. Tài khoản mới hoặc chỉnh sửa cần admin duyệt trước khi rút.</p></Card>
    <MutationForm title="Thêm tài khoản ngân hàng" path="me/bank-accounts" fields={bankFields} schema={bankSchema} />
    <FinanceTable path="me/bank-accounts" searchLabel="Tên chủ tài khoản" states={['PENDING','APPROVED','REJECTED']} specs={[['bankName','Ngân hàng'],['accountHolder','Chủ tài khoản'],['lastFour','4 số cuối'],['status','Trạng thái','status'],['reviewReason','Kết quả duyệt']]} actions={row => <div className="flex gap-2">
      <ActionDialog label="Thay thông tin"><MutationForm title="Tạo phiên bản tài khoản mới" path={'me/bank-accounts/' + row.id} method="patch" fields={bankFields} schema={bankSchema} /></ActionDialog>
      <ActionDialog label="Gỡ"><p className="mb-3">Gỡ tài khoản khỏi danh sách sử dụng? Yêu cầu rút đã tạo vẫn giữ nguyên thông tin.</p><Button variant="outline" onClick={() => void financeService.remove('me/bank-accounts/' + row.id).then(() => { toast.success('Đã gỡ'); void refresh(); }).catch(e => toast.error(e.message))}>Xác nhận gỡ</Button></ActionDialog>
    </div>} />
  </Page>;
}
