"use client";
import LanguageSwitcher from '@/components/locale/language-switcher';
import { useCopy } from '@/i18n/use-copy';
import { LoginBenefits, LoginForm } from '@/modules/auth/components/login-form';
export default function LoginPage(){
 const t=useCopy();
 return <main className="grid min-h-dvh bg-card lg:grid-cols-2"><LoginBenefits/><section className="flex flex-col px-5 py-6 sm:px-8 lg:px-12"><div className="flex items-center justify-between gap-4"><p className="font-semibold text-primary lg:invisible">BuyBack NexoraVN</p><LanguageSwitcher/></div><div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10"><header className="mb-8"><h1 className="text-2xl font-bold lg:text-3xl">{t('Chào mừng trở lại')}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{t('Đăng nhập để tiếp tục quản lý cashback của bạn.')}</p></header><LoginForm/><p className="mt-8 text-xs leading-5 text-muted-foreground">{t('Bằng việc đăng nhập, bạn đồng ý với điều khoản bảo mật và sử dụng của BuyBack NexoraVN.')}</p></div></section></main>;
}
