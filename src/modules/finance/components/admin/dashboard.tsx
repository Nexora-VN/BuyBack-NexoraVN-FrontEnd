'use client';
import { useCopy } from "@/i18n/use-copy";

import { StatCard } from '@/components/ui/card';
import { Page } from '@/components/ui/page';
import { Link } from '@/i18n/navigation';
import { useFinance } from '../../hooks/use-finance';
import type { Dashboard } from '../../types/finance';
import { Failure,Loading } from '.././finance-ui';
import { DashboardContent } from '.././user-pages';
import { ProviderHealth } from './provider';
export function AdminDashboardPage() {
 const t=useCopy();

 const query=useFinance<Dashboard>('admin/dashboard');
 return <Page title={t("Tổng quan vận hành")}>{query.isLoading?<Loading/>:query.isError?<Failure message={query.error.message} retry={()=>void query.refetch()}/>:<div className="grid gap-4 sm:grid-cols-3">{[
 ['pendingWithdrawals',t("Yêu cầu rút chờ xử lý"),'/admin/withdrawals?withdrawals-status=PENDING'],
 ['pendingBanks',t("Ngân hàng chờ duyệt"),'/admin/bank-accounts?bank-accounts-status=PENDING'],
 ['openIssues',t("Vấn đề đối soát"),'/admin/reconciliation/issues?issues-status=OPEN'],
 ].map(([key,label,href])=><Link key={key} href={href}><StatCard label={t(label)} value={query.data?.operations?.[key as keyof NonNullable<Dashboard['operations']>]??'—'}/></Link>)}</div>}<ProviderHealth/><DashboardContent admin/></Page>;
}
