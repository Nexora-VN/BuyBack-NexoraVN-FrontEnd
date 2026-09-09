import { AuthGuard } from "@/modules/auth/components/auth-guard";
import { UserShell } from "@/layouts/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) { return <AuthGuard roles={["USER", "ADMIN", "SUPER_ADMIN"]}><UserShell>{children}</UserShell></AuthGuard>; }
