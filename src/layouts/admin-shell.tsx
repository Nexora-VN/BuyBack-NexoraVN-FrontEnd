"use client";
import LanguageSwitcher from "@/components/locale/language-switcher";
import { ConfirmProvider } from "@/components/patterns/confirm-provider";
import { SurfaceDialog } from "@/components/patterns/surface-dialog";
import { Link,usePathname,useRouter } from "@/i18n/navigation";
import { useCopy } from "@/i18n/use-copy";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/components/auth-provider";
import { Activity,Boxes,CircleDollarSign,ClipboardCheck,FileClock,Gauge,Link2,LogOut,Menu,PackageSearch,Settings,SlidersHorizontal,Users,WalletCards } from "lucide-react";
import { useState } from "react";
const groups=[
 {label:'Quản lý',items:[['/admin','Tổng quan',Gauge],['/admin/users','Người dùng',Users],['/admin/products','Sản phẩm',PackageSearch],['/admin/links','Liên kết affiliate',Link2],['/admin/orders','Đơn hàng',Boxes]]},
 {label:'Tài chính',items:[['/admin/commissions','Hoa hồng',CircleDollarSign],['/admin/withdrawals','Rút tiền',WalletCards],['/admin/bank-accounts','Duyệt ngân hàng',ClipboardCheck],['/admin/settlements','Kỳ thanh toán',CircleDollarSign],['/admin/wallet/ledger','Sổ giao dịch',FileClock],['/admin/manual-adjustments','Điều chỉnh ví',SlidersHorizontal]]},
 {label:'Vận hành',items:[['/admin/reconciliation','Đối soát',FileClock],['/admin/reconciliation/issues','Vấn đề đối soát',Activity],['/admin/audit-logs','Nhật ký',Activity]]},
 {label:'Hệ thống',items:[['/admin/provider-sync','Kết nối đối tác',SlidersHorizontal],['/admin/system','Chính sách hệ thống',Settings]]},
] as const;
function active(path:string,href:string){const candidates=groups.flatMap(g=>g.items.map(i=>i[0])).filter(r=>path===r || (r!=='/admin'&&path.startsWith(r+'/')));return candidates.sort((a,b)=>b.length-a.length)[0]===href;}
function AdminNav({close}:{close?:()=>void}) {
 const t=useCopy();const path=usePathname();const {user}=useAuth();
 return <nav className="space-y-6">{groups.map(group=><section key={group.label}><h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t(group.label)}</h2><div className="space-y-1">{group.items.filter(([href])=>href!=='/admin/manual-adjustments'||user?.role==='SUPER_ADMIN').map(([href,label,Icon])=><Link onClick={close} key={href} href={href} aria-current={active(path,href)?'page':undefined} className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium',active(path,href)?'bg-secondary text-primary':'text-muted-foreground hover:bg-muted')}><Icon className="size-5 shrink-0"/>{t(label)}</Link>)}</div></section>)}</nav>;
}
export function AdminShell({children}:{children:React.ReactNode}) {
 const t=useCopy();const [open,setOpen]=useState(false);const path=usePathname();const {user,logout}=useAuth();const router=useRouter();
 const tabs=[['/admin',t("Tổng quan"),Gauge],['/admin/orders',t("Đơn hàng"),Boxes],['/admin/reconciliation',t("Đối soát"),FileClock],['/admin/withdrawals',t("Rút tiền"),WalletCards]] as const;
 async function signOut(){await logout();router.replace('/login');}
 return <ConfirmProvider><div className="admin-workspace min-h-dvh bg-background lg:pl-64">
  <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-card lg:flex"><Link href="/admin" className="flex h-20 shrink-0 items-center gap-3 px-6 font-bold text-primary"><WalletCards/><span>BuyBack <small className="block text-xs font-medium text-muted-foreground">{t("Admin · NexoraVN")}</small></span></Link><div className="flex-1 overflow-y-auto px-3 pb-6"><AdminNav/></div><div className="space-y-3 border-t p-4"><p className="truncate text-xs text-muted-foreground">{user?.email}</p><LanguageSwitcher/><button onClick={signOut} className="flex min-h-11 items-center gap-2 text-sm text-danger"><LogOut className="size-4"/>{t('Đăng xuất')}</button></div></aside>
  <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden"><Link href="/admin" className="flex items-center gap-2 font-bold text-primary"><WalletCards className="size-5"/>{t("BuyBack Admin")}</Link><button onClick={()=>setOpen(true)} aria-label={t('Mở menu quản trị')} className="grid size-11 place-items-center rounded-xl hover:bg-muted"><Menu/></button></header>
  <main id="main-content">{children}</main>
  <nav className="app-bottom-nav grid grid-cols-5" aria-label={t('Điều hướng quản trị')}>{tabs.map(([href,label,Icon])=><Link key={href} href={href} aria-current={active(path,href)?'page':undefined} className={cn('flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium',active(path,href)?'bg-secondary text-primary':'text-muted-foreground')}><Icon className="size-5"/>{t(label)}</Link>)}<button onClick={()=>setOpen(true)} aria-expanded={open} className="flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground"><Menu className="size-5"/>{t('Menu')}</button></nav>
  <SurfaceDialog open={open} onOpenChange={setOpen} title={t("Menu quản trị")}><AdminNav close={()=>setOpen(false)}/><div className="mt-6 space-y-3 border-t pt-5"><LanguageSwitcher/><p className="break-all text-sm">{user?.email}</p><button onClick={signOut} className="flex min-h-11 items-center gap-2 text-danger"><LogOut className="size-4"/>{t('Đăng xuất')}</button></div></SurfaceDialog>
 </div></ConfirmProvider>;
}
