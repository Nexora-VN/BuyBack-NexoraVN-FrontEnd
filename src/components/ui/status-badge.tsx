"use client";
import { CircleCheck, CircleX, Clock3, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCopy } from "@/i18n/use-copy";
export type StatusDomain='general'|'order'|'commission'|'cashback'|'withdrawal'|'bank';
const labels:Record<string,string>={ACTIVE:'Hoạt động',WORKING:'Hoạt động',COMPLETED:'Hoàn thành',AVAILABLE:'Khả dụng',VALIDATED:'Đã xác thực',PENDING:'Chờ xử lý',PROCESSING:'Đang xử lý',REJECTED:'Từ chối',FAILED:'Thất bại',DISABLED:'Đã khóa',DELETED:'Đã xóa',ESTIMATED:'Hoa hồng dự kiến',MANUAL_REVIEW:'Cần đối chiếu',PARTIALLY_VALIDATED:'Hoàn thành một phần',PAID:'Đã quyết toán',REVERSED:'Đã thu hồi',completed:'Hoàn thành',cancelled:'Đã hủy / Không hợp lệ',APPROVED:'Đã duyệt',QUEUED:'Chờ đồng bộ',RUNNING:'Đang đồng bộ',OPEN:'Chưa xử lý',RESOLVED:'Đã xử lý',DRAFT:'Bản nháp',CONFIRMED:'Đã xác nhận',CANCELLED:'Đã hủy',EXPIRED:'Hết hạn',UNVERIFIED:'Chưa xác thực'};
const contextual:Partial<Record<StatusDomain,Record<string,string>>>={order:{VALIDATED:'Hoàn thành',REJECTED:'Đã hủy / Không hợp lệ'},commission:{VALIDATED:'Đủ điều kiện quyết toán',PAID:'Đã quyết toán'},cashback:{PENDING:'Chờ xác nhận',VALIDATED:'Chờ quyết toán',AVAILABLE:'Có thể rút'},withdrawal:{PENDING:'Chờ xử lý',COMPLETED:'Đã chuyển tiền',FAILED:'Chuyển thất bại'},bank:{PENDING:'Chờ duyệt',APPROVED:'Đã duyệt'}};
export function statusLabel(status:string,domain:StatusDomain='general'){return contextual[domain]?.[status]??labels[status]??status;}
export function StatusBadge({status,domain='general'}:{status:string;domain?:StatusDomain}){
 const t=useCopy();const failed=['REJECTED','FAILED','REVERSED','CANCELLED','cancelled','DISABLED','EXPIRED'].includes(status);const success=['ACTIVE','WORKING','AVAILABLE','PAID','COMPLETED','completed','CONFIRMED','APPROVED','RESOLVED'].includes(status);const running=['RUNNING','PROCESSING'].includes(status);const Icon=failed?CircleX:success?CircleCheck:running?LoaderCircle:Clock3;
 return <Badge variant={failed?'danger':success?'success':running?'info':'warning'}><Icon aria-hidden className={`size-3.5 shrink-0 ${running?'animate-spin':''}`}/><span className="whitespace-normal">{t(statusLabel(status,domain))}</span></Badge>;
}
