import { AdminShell } from "@/layouts/admin-shell";
import { AuthGuard } from "@/modules/auth/components/auth-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) { return <AuthGuard roles={["ADMIN", "SUPER_ADMIN"]}><AdminShell>{children}</AdminShell></AuthGuard>; }
