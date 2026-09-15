'use client';
import { useRef,useState } from 'react';
import { useConfirm } from '@/components/patterns/confirm-provider';
import { useCopy } from "@/i18n/use-copy";

import LanguageSwitcher from '@/components/locale/language-switcher';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Page } from '@/components/ui/page';
import { Link,useRouter } from '@/i18n/navigation';
import { useAuth } from '@/modules/auth/components/auth-provider';
import { toast } from 'sonner';
import { useRefreshFinance } from '../../hooks/use-finance';
import { bankSchema } from '../../schemas/finance';
import { financeService } from '../../services/finance';
import { ActionDialog,FinanceTable,MutationForm,text } from '.././finance-ui';

export const bankFields = [{ name:'bankCode', label:'Mã ngân hàng' },{ name:'bankName', label:'Tên ngân hàng' },{ name:'accountHolder', label:'Tên chủ tài khoản' },{ name:'accountNumber', label:'Số tài khoản' }];

export function AccountPage() {
 const t=useCopy();

  const router = useRouter();
  const { user, logout } = useAuth();
  const refresh = useRefreshFinance();const confirm=useConfirm();const [removing,setRemoving]=useState<string|null>(null);const removeLock=useRef(false);
 async function remove(id:string){if(removeLock.current)return;if(!await confirm(t('Gỡ tài khoản khỏi danh sách sử dụng? Yêu cầu rút đã tạo vẫn giữ nguyên thông tin.')))return;removeLock.current=true;setRemoving(id);try{await financeService.remove('me/bank-accounts/'+id);await refresh();toast.success(t('Đã gỡ'));}catch(error){toast.error(t.error(error instanceof Error?error.message:'Không thể xóa'));}finally{setRemoving(null);removeLock.current=false;}}
  return <Page title={t("Tài khoản của tôi")}><Card><h2 className="font-semibold">{user?.email}</h2><p className="mt-2 text-sm text-muted-foreground">{t("Thông tin tài khoản thanh toán được mã hóa. Tài khoản mới hoặc chỉnh sửa cần admin duyệt trước khi rút.")}</p></Card>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{t("Tài khoản ngân hàng")}</h2><ActionDialog label="Thêm tài khoản ngân hàng"><MutationForm title={t("Thêm tài khoản ngân hàng")} path="me/bank-accounts" fields={bankFields} schema={bankSchema}/></ActionDialog></div>
    <FinanceTable path="me/bank-accounts" searchLabel="Tên chủ tài khoản" states={['PENDING','APPROVED','REJECTED']} specs={[['bankName',t("Ngân hàng")],['accountHolder',t("Chủ tài khoản")],['lastFour',t("4 số cuối")],['status',t("Trạng thái"),'status'],['reviewReason',t("Kết quả duyệt")]]} actions={row => <div className="flex gap-2">
      <ActionDialog label="Thay thông tin"><MutationForm title={t("Tạo phiên bản tài khoản mới")} path={'me/bank-accounts/' + row.id} method="patch" fields={bankFields} schema={bankSchema} initialValues={{bankCode:text(row,'bankCode'),bankName:text(row,'bankName'),accountHolder:text(row,'accountHolder')}} /></ActionDialog>
      <Button variant="outline" disabled={removing!==null} onClick={()=>void remove(row.id)}>{t('Gỡ')}</Button>
    </div>} />
    <Card><h2 className="mb-4 font-semibold">{t("Ngôn ngữ")}</h2><LanguageSwitcher/></Card>
    <div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link href="/app/links">{t("Link của tôi")}</Link></Button><Button variant="outline" onClick={async()=>{await logout();router.replace('/login');}}>{t("Đăng xuất")}</Button></div>
  </Page>;
}
