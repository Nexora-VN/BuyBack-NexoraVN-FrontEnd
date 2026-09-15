"use client";
import { useCopy } from '@/i18n/use-copy';
import type { SettlementEligibilityDTO } from '../types/finance';
export const blockerLabels: Record<string,string> = {
 COMMISSION_NOT_VALIDATED:'Hoa hồng chưa được xác thực', NO_ATTRIBUTED_USER:'Đơn chưa gắn người dùng', ALREADY_IN_SETTLEMENT:'Đã thuộc một kỳ thanh toán',
 ADDLIVETAG_CHECKOUT_REQUIRED:'Chỉ hỗ trợ đơn AddLiveTag', PROVIDER_COMMISSION_NOT_PAID:'Đối tác chưa xác nhận trả hoa hồng', VERIFY_ACCOUNT_AND_VND_FIRST:'Cần xác thực tài khoản và đơn vị VND', OPEN_RECONCILIATION_ISSUES:'Còn vấn đề đối soát chưa xử lý', CROSS_PROVIDER_DUPLICATE:'Trùng đơn giữa các nguồn',
 ACCOUNT_UNIT_UNVERIFIED:'Cần xác thực tài khoản và đơn vị VND', MISSING_PROVIDER_ITEMS:'Thiếu dữ liệu sản phẩm từ đối tác', PROVIDER_COMMISSION_PENDING:'Đối tác chưa xác nhận trả hoa hồng', PROVIDER_COMMISSION_UNKNOWN:'Chưa xác định trạng thái trả hoa hồng', PROVIDER_COMMISSION_REJECTED:'Hoa hồng bị đối tác từ chối', NO_COMPLETED_ITEMS:'Chưa có sản phẩm hoàn thành',
};
export function SettlementEligibility({value}:{value:unknown}) {
 const t=useCopy();const eligibility=value as SettlementEligibilityDTO|undefined;
 if(!eligibility)return <p className="text-sm text-muted-foreground">{t('Chưa có thông tin điều kiện')}</p>;
 if(eligibility.eligible)return <p className="text-sm font-medium text-success">{t('Đủ điều kiện quyết toán')}</p>;
 return <div className="space-y-2 text-sm"><ul className="list-inside list-disc text-warning">{eligibility.blockers.map(code=><li key={code}>{t(blockerLabels[code]??'Cần kiểm tra điều kiện đối soát')}</li>)}</ul><details><summary className="min-h-11 cursor-pointer text-muted-foreground">{t('Mã tra cứu')}</summary><p className="break-all font-mono text-xs">{eligibility.blockers.join(' · ')}</p></details></div>;
}
