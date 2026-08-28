import { env } from "@/constants/env";
import { EmptyState } from "@/components/ui/page";

export function MockGate({ children }: { children: React.ReactNode }) {
  if (!env.mockFutureModules) return <EmptyState title="Tính năng đang được phát triển" description="Backend cho module này chưa sẵn sàng. Dữ liệu mẫu đã được tắt trong môi trường hiện tại." />;
  return children;
}
