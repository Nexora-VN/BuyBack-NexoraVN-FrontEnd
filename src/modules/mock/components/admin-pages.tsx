"use client";

import {
  Activity,
  AlertTriangle,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  CloudCog,
  Database,
  FileClock,
  Gauge,
  ListRestart,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ServerCog,
  ShieldAlert,
  Users,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MockBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input, Select, Textarea } from "@/components/ui/input";
import { EmptyState, Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatDateTime, formatVnd } from "@/lib/format";
import { apiClient } from "@/lib/api/client";
import { MockGate } from "@/modules/mock/components/mock-gate";
import { useMockDatabase } from "@/modules/mock/hooks/use-mock-database";
import type { MockStatus } from "@/modules/mock/types/mock";

export function AdminDashboardPage() {
  const { data, reset } = useMockDatabase();
  const commission = data.orders.reduce((sum, row) => sum + row.commission, 0);
  return (
    <Page
      title="Tổng quan quản trị"
      description="Tổng hợp vận hành BuyBack và luồng tiền Shopee/Saffi."
      badge={<MockBadge />}
      actions={
        <Button
          variant="outline"
          onClick={() => {
            reset();
            toast.success("Đã reset dữ liệu mẫu");
          }}
        >
          <RotateCcw />
          Reset mock
        </Button>
      }
    >
      <MockGate>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Người dùng hoạt động"
            value="1.284"
            icon={<Users />}
          />
          <StatCard
            label="Commission"
            value={formatVnd(commission)}
            icon={<CircleDollarSign />}
          />
          <StatCard
            label="Cashback 85%"
            value={formatVnd(Math.floor((commission * 85) / 100))}
            icon={<WalletCards />}
          />
          <StatCard
            label="Chờ đối soát"
            value={data.orders.filter((o) => o.status === "PENDING").length}
            icon={<FileClock />}
          />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <Card>
            <div className="flex justify-between">
              <h2 className="font-semibold">Tình hình đơn hàng</h2>
              <Link href="/admin/orders" className="text-sm text-primary">
                Xem chi tiết
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                [
                  "Khả dụng",
                  data.orders.filter((o) => o.status === "AVAILABLE").length,
                  "text-success bg-success-soft",
                ],
                [
                  "Chờ xử lý",
                  data.orders.filter((o) => o.status === "PENDING").length,
                  "text-warning bg-warning-soft",
                ],
                [
                  "Từ chối",
                  data.orders.filter((o) => o.status === "REJECTED").length,
                  "text-danger bg-danger-soft",
                ],
              ].map(([label, value, cls]) => (
                <div className={`rounded-xl p-4 ${cls}`} key={String(label)}>
                  <p className="text-sm">{label}</p>
                  <p className="mt-2 text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold">Trạng thái provider</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="flex items-center gap-2">
                  <ServerCog className="text-primary" />
                  Shopee
                </span>
                <StatusBadge status="COMPLETED" />
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="flex items-center gap-2">
                  <CloudCog className="text-primary" />
                  Saffi
                </span>
                <StatusBadge status="PROCESSING" />
              </div>
            </div>
          </Card>
        </div>
      </MockGate>
    </Page>
  );
}

export function AdminOrdersPage() {
  const { data, update } = useMockDatabase();
  const [search, setSearch] = useState("");
  const rows = data.orders.filter((r) =>
    `${r.id} ${r.product} ${r.shop}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const setStatus = (id: string, status: MockStatus) => {
    update((db) => ({
      ...db,
      orders: db.orders.map((row) =>
        row.id === id ? { ...row, status } : row,
      ),
    }));
    toast.success("Đã cập nhật trạng thái mẫu");
  };
  return (
    <Page
      title="Danh sách đơn hàng"
      description="Đơn hàng Shopee theo hierarchy đối soát."
      badge={<MockBadge />}
    >
      <MockGate>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            placeholder="Tìm mã đơn, sản phẩm hoặc shop"
          />
        </div>
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "id",
              label: "Order ID",
              render: (row) => <strong>#{row.id}</strong>,
            },
            {
              key: "product",
              label: "Sản phẩm",
              render: (row) => (
                <div className="max-w-64">
                  <p className="truncate font-medium">{row.product}</p>
                  <p className="text-xs text-muted-foreground">{row.shop}</p>
                </div>
              ),
            },
            {
              key: "value",
              label: "Giá trị",
              className: "text-right",
              render: (row) => formatVnd(row.amount),
            },
            {
              key: "commission",
              label: "Commission",
              className: "text-right",
              render: (row) => formatVnd(row.commission),
            },
            {
              key: "cashback",
              label: "Cashback",
              className: "text-right",
              render: (row) => (
                <strong className="text-primary">
                  {formatVnd(row.cashback)}
                </strong>
              ),
            },
            {
              key: "status",
              label: "Trạng thái nội bộ",
              render: (row) => (
                <Select
                  className="h-9 w-40"
                  value={row.status}
                  onChange={(e) =>
                    setStatus(row.id, e.target.value as MockStatus)
                  }
                >
                  <option>PENDING</option>
                  <option>VALIDATED</option>
                  <option>AVAILABLE</option>
                  <option>REJECTED</option>
                </Select>
              ),
            },
            {
              key: "provider",
              label: "Provider",
              render: (row) => row.providerStatus,
            },
          ]}
        />
      </MockGate>
    </Page>
  );
}

export function CommissionAdminPage() {
  const { data } = useMockDatabase();
  const total = data.orders.reduce((sum, row) => sum + row.commission, 0);
  const user = data.orders.reduce((sum, row) => sum + row.cashback, 0);
  return (
    <Page
      title="Commission & Cashback"
      description="Theo dõi phân bổ commission từ provider."
      badge={<MockBadge />}
      actions={
        <Button asChild>
          <Link href="/admin/manual-adjustments">
            <Plus />
            Tạo điều chỉnh
          </Link>
        </Button>
      }
    >
      <MockGate>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Tổng commission"
            value={formatVnd(total)}
            helper="100% từ provider"
            icon={<Banknote />}
          />
          <StatCard
            label="Cashback cấp user"
            value={formatVnd(user)}
            helper="Tỷ lệ 85%"
            icon={<WalletCards />}
          />
          <StatCard
            label="Doanh thu nền tảng"
            value={formatVnd(total - user)}
            helper="Tỷ lệ 15%"
            icon={<CircleDollarSign />}
          />
        </div>
        <Card>
          <h2 className="font-semibold">Nguyên tắc ghi nhận</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              "ESTIMATED/PENDING chưa được rút",
              "PAID mới tạo cashback AVAILABLE",
              "Clawback tạo ledger reversal",
            ].map((item) => (
              <div key={item} className="rounded-xl bg-muted p-4 text-sm">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </MockGate>
    </Page>
  );
}

export function LedgerAdminPage() {
  const { data } = useMockDatabase();
  const [type, setType] = useState("");
  const rows = data.ledger.filter((row) => !type || row.type === type);
  return (
    <Page
      title="Ví & Ledger"
      description="Ledger giao dịch tài chính, searchable và append-only."
      badge={<MockBadge />}
      actions={
        <Button asChild>
          <Link href="/admin/manual-adjustments">
            <Plus />
            Tạo điều chỉnh
          </Link>
        </Button>
      }
    >
      <MockGate>
        <Select
          className="max-w-56"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Tất cả loại</option>
          <option>CASHBACK</option>
          <option>WITHDRAWAL</option>
          <option>ADJUSTMENT</option>
        </Select>
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "id",
              label: "Transaction ID",
              render: (row) => (
                <span className="font-mono text-xs">{row.id}</span>
              ),
            },
            { key: "user", label: "Người dùng", render: (row) => row.user },
            { key: "type", label: "Loại", render: (row) => row.type },
            {
              key: "amount",
              label: "Số tiền (+/-)",
              className: "text-right",
              render: (row) => (
                <strong
                  className={row.amount >= 0 ? "text-success" : "text-danger"}
                >
                  {row.amount >= 0 ? "+" : ""}
                  {formatVnd(row.amount)}
                </strong>
              ),
            },
            {
              key: "balance",
              label: "Số dư sau",
              className: "text-right",
              render: (row) => formatVnd(row.balanceAfter),
            },
            { key: "ref", label: "Tham chiếu", render: (row) => row.reference },
            {
              key: "time",
              label: "Thời gian",
              render: (row) => formatDateTime(row.createdAt),
            },
          ]}
        />
      </MockGate>
    </Page>
  );
}

export function WithdrawalsAdminPage() {
  const { data, update } = useMockDatabase();
  const setStatus = (id: string, status: MockStatus) => {
    update((db) => ({
      ...db,
      withdrawals: db.withdrawals.map((row) =>
        row.id === id ? { ...row, status } : row,
      ),
    }));
    toast.success("Đã cập nhật trạng thái rút tiền mẫu");
  };
  return (
    <Page
      title="Quản lý rút tiền"
      description="Admin chuyển khoản thủ công và cập nhật trạng thái."
      badge={<MockBadge />}
    >
      <MockGate>
        <DataTable
          rows={data.withdrawals}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "id",
              label: "Yêu cầu",
              render: (row) => <strong>{row.id}</strong>,
            },
            {
              key: "amount",
              label: "Số tiền",
              className: "text-right",
              render: (row) => formatVnd(row.amount),
            },
            {
              key: "bank",
              label: "Ngân hàng",
              render: (row) => (
                <div>
                  <p>{row.bank}</p>
                  <p className="text-xs text-muted-foreground">{row.account}</p>
                </div>
              ),
            },
            {
              key: "date",
              label: "Ngày tạo",
              render: (row) => formatDateTime(row.createdAt),
            },
            {
              key: "status",
              label: "Trạng thái",
              render: (row) => (
                <Select
                  className="h-9 w-40"
                  value={row.status}
                  onChange={(e) =>
                    setStatus(row.id, e.target.value as MockStatus)
                  }
                >
                  <option>PENDING</option>
                  <option>PROCESSING</option>
                  <option>COMPLETED</option>
                  <option>REJECTED</option>
                  <option>FAILED</option>
                </Select>
              ),
            },
          ]}
        />
      </MockGate>
    </Page>
  );
}

export function ReconciliationPage() {
  const { data } = useMockDatabase();
  return (
    <Page
      title="Quản lý đối soát"
      description="Các batch đồng bộ và kết quả match dữ liệu provider."
      badge={<MockBadge />}
    >
      <MockGate>
        <DataTable
          rows={data.reconciliations}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "id",
              label: "Batch",
              render: (row) => (
                <Link
                  href={`/admin/reconciliation/${row.id}`}
                  className="font-semibold text-primary"
                >
                  {row.id}
                </Link>
              ),
            },
            {
              key: "provider",
              label: "Provider",
              render: (row) => row.provider,
            },
            {
              key: "records",
              label: "Records",
              className: "text-right",
              render: (row) => row.records.toLocaleString("vi-VN"),
            },
            {
              key: "matched",
              label: "Matched",
              className: "text-right",
              render: (row) => (
                <span className="text-success">
                  {row.matched.toLocaleString("vi-VN")}
                </span>
              ),
            },
            {
              key: "mismatch",
              label: "Mismatch",
              className: "text-right",
              render: (row) => (
                <span className="text-danger">{row.mismatched}</span>
              ),
            },
            {
              key: "status",
              label: "Trạng thái",
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "date",
              label: "Thời gian",
              render: (row) => formatDateTime(row.createdAt),
            },
          ]}
        />
      </MockGate>
    </Page>
  );
}

export function ReconciliationDetailPage({ id }: { id: string }) {
  const { data } = useMockDatabase();
  const item = data.reconciliations.find((row) => row.id === id);
  return (
    <Page title="Chi tiết đối soát" description={id} badge={<MockBadge />}>
      <MockGate>
        {!item ? (
          <EmptyState
            title="Không tìm thấy batch"
            description="Batch đối soát không tồn tại trong dữ liệu mẫu."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Tổng records"
                value={item.records.toLocaleString("vi-VN")}
                icon={<Database />}
              />
              <StatCard
                label="Matched"
                value={item.matched.toLocaleString("vi-VN")}
                icon={<CheckCircle2 />}
              />
              <StatCard
                label="Mismatch"
                value={item.mismatched}
                icon={<AlertTriangle />}
              />
              <StatCard
                label="Provider"
                value={item.provider}
                icon={<CloudCog />}
              />
            </div>
            <Card>
              <h2 className="font-semibold">Thông tin batch</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Trạng thái</dt>
                  <dd className="mt-1">
                    <StatusBadge status={item.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Bắt đầu</dt>
                  <dd className="mt-1 font-medium">
                    {formatDateTime(item.createdAt)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-muted-foreground">Ghi chú</dt>
                  <dd className="mt-1">
                    Dữ liệu raw payload sẽ được hiển thị khi Reconciliation API
                    được triển khai.
                  </dd>
                </div>
              </dl>
            </Card>
          </>
        )}
      </MockGate>
    </Page>
  );
}

export function AuditLogPage() {
  const rows = [
    {
      id: "AUD-9041",
      actor: "admin@nexora.vn",
      action: "UPDATE_WITHDRAWAL",
      target: "WDR-1042",
      date: "2026-08-27T14:35:00Z",
    },
    {
      id: "AUD-9040",
      actor: "system",
      action: "SYNC_SAFFI",
      target: "REC-20260827-01",
      date: "2026-08-27T14:32:05Z",
    },
    {
      id: "AUD-9039",
      actor: "admin@nexora.vn",
      action: "UPDATE_USER",
      target: "user_8821a",
      date: "2026-08-27T13:20:00Z",
    },
  ];
  return (
    <Page
      title="Lịch sử hệ thống"
      description="Audit trail cho thao tác nhạy cảm và thay đổi trạng thái."
      badge={<MockBadge />}
    >
      <MockGate>
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "id",
              label: "Event ID",
              render: (row) => (
                <span className="font-mono text-xs">{row.id}</span>
              ),
            },
            { key: "actor", label: "Actor", render: (row) => row.actor },
            { key: "action", label: "Action", render: (row) => row.action },
            { key: "target", label: "Target", render: (row) => row.target },
            {
              key: "date",
              label: "Thời gian",
              render: (row) => formatDateTime(row.date),
            },
          ]}
        />
      </MockGate>
    </Page>
  );
}

export function ProviderSyncPage() {
  const { data, update } = useMockDatabase();
  const retry = (id: string) => {
    update((db) => ({
      ...db,
      reconciliations: db.reconciliations.map((row) =>
        row.id === id ? { ...row, status: "PROCESSING" } : row,
      ),
    }));
    toast.success("Đã đưa job vào hàng chờ thử lại");
  };
  return (
    <Page
      title="Provider Sync Status"
      description="Giám sát đồng bộ Shopee và Saffi."
      badge={<MockBadge />}
      actions={
        <Button onClick={() => toast.success("Đã làm mới trạng thái mẫu")}>
          <RefreshCw />
          Refresh
        </Button>
      }
    >
      <MockGate>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">Shopee</h2>
              <StatusBadge status="COMPLETED" />
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Last sync</dt>
                <dd>2 phút trước</dd>
              </div>
              <div className="flex justify-between">
                <dt>Latency</dt>
                <dd>450ms</dd>
              </div>
              <div className="flex justify-between">
                <dt>Error rate</dt>
                <dd>0,02%</dd>
              </div>
            </dl>
          </Card>
          <Card>
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">Saffi</h2>
              <StatusBadge status="PROCESSING" />
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Last sync</dt>
                <dd>14 phút trước</dd>
              </div>
              <div className="flex justify-between">
                <dt>Latency</dt>
                <dd>1.250ms</dd>
              </div>
              <div className="flex justify-between">
                <dt>Error rate</dt>
                <dd className="text-danger">4,5%</dd>
              </div>
            </dl>
          </Card>
          <StatCard
            label="Đã đồng bộ 24h"
            value="142.500"
            helper="8 failed jobs"
            icon={<Gauge />}
          />
        </div>
        <DataTable
          rows={data.reconciliations}
          rowKey={(row) => row.id}
          columns={[
            { key: "id", label: "Job ID", render: (row) => row.id },
            {
              key: "provider",
              label: "Provider",
              render: (row) => row.provider,
            },
            {
              key: "status",
              label: "Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "time",
              label: "Timestamp",
              render: (row) => formatDateTime(row.createdAt),
            },
            {
              key: "action",
              label: "",
              className: "text-right",
              render: (row) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => retry(row.id)}
                >
                  <ListRestart />
                  Retry
                </Button>
              ),
            },
          ]}
        />
      </MockGate>
    </Page>
  );
}

export function ManualAdjustmentsPage() {
  const { data, update } = useMockDatabase();
  const [user, setUser] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const submit = () => {
    const value = Number(amount);
    if (
      !user.trim() ||
      !Number.isInteger(value) ||
      value === 0 ||
      reason.trim().length < 10
    ) {
      toast.error("Nhập user, số tiền nguyên khác 0 và lý do ít nhất 10 ký tự");
      return;
    }
    const lastBalance = data.ledger[0]?.balanceAfter ?? 0;
    update((db) => ({
      ...db,
      ledger: [
        {
          id: `ADJ-${Date.now()}`,
          user,
          type: "ADJUSTMENT",
          amount: value,
          balanceAfter: lastBalance + value,
          reference: reason,
          createdAt: new Date().toISOString(),
        },
        ...db.ledger,
      ],
    }));
    setAmount("");
    setReason("");
    toast.success("Đã tạo điều chỉnh mẫu");
  };
  return (
    <Page
      title="Manual Adjustments"
      description="Can thiệp tài chính trực tiếp cần lý do và audit trail."
      badge={<MockBadge />}
    >
      <MockGate>
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <Card>
            <h2 className="text-lg font-semibold">Tạo điều chỉnh</h2>
            <div className="mt-5 space-y-4">
              <label>
                <span className="mb-1.5 block text-sm">User ID / Email</span>
                <Input
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="Tìm người dùng"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-sm">Số tiền VND (+/-)</span>
                <Input
                  type="number"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <label>
                <span className="mb-1.5 block text-sm">Lý do bắt buộc</span>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Mô tả chi tiết lý do điều chỉnh..."
                />
              </label>
              <Button className="w-full" onClick={submit}>
                <Plus />
                Tạo điều chỉnh
              </Button>
            </div>
          </Card>
          <DataTable
            rows={data.ledger.filter((row) => row.type === "ADJUSTMENT")}
            rowKey={(row) => row.id}
            columns={[
              { key: "id", label: "ID", render: (row) => row.id },
              { key: "user", label: "User", render: (row) => row.user },
              {
                key: "amount",
                label: "Số tiền",
                className: "text-right",
                render: (row) => formatVnd(row.amount),
              },
              { key: "reason", label: "Lý do", render: (row) => row.reference },
              {
                key: "time",
                label: "Thời gian",
                render: (row) => formatDateTime(row.createdAt),
              },
            ]}
          />
        </div>
      </MockGate>
    </Page>
  );
}

export function SystemConfigPage() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.get<{ status: string }>("/api/backend/health"),
    retry: false,
  });
  const [userRate, setUserRate] = useState("85");
  const [platformRate, setPlatformRate] = useState("15");
  const [min, setMin] = useState("");
  const save = () => {
    if (Number(userRate) + Number(platformRate) !== 100) {
      toast.error("Tổng tỷ lệ phải bằng 100%");
      return;
    }
    toast.success("Đã lưu cấu hình mẫu");
  };
  return (
    <Page
      title="Health & Configuration"
      description="Trạng thái hệ thống và tham số toàn cục."
      badge={<MockBadge />}
    >
      <MockGate>
        <Card className="bg-gradient-to-r from-white to-secondary">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className={`flex items-center gap-2 text-xl font-bold ${health.isSuccess ? "text-success" : health.isError ? "text-danger" : "text-warning"}`}>
                {health.isSuccess ? <CheckCircle2 /> : health.isError ? <AlertTriangle /> : <RefreshCw className="animate-spin" />}
                {health.isSuccess ? "Backend Operational" : health.isError ? "Backend Unavailable" : "Checking Backend"}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Health API được bind trực tiếp với backend.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => health.refetch()}
            >
              <RefreshCw />
              Refresh status
            </Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-4">
              <Activity className="text-success" />
              <p className="mt-2 text-xs text-muted-foreground">API status</p>
              <strong>{health.data?.status ?? (health.isLoading ? "Checking" : "Offline")}</strong>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <Database className="text-success" />
              <p className="mt-2 text-xs text-muted-foreground">DB load</p>
              <strong>Chưa có dữ liệu</strong>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <CloudCog className="text-info" />
              <p className="mt-2 text-xs text-muted-foreground">
                Provider sync
              </p>
              <strong>Dữ liệu mẫu</strong>
            </div>
          </div>
        </Card>
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <Card>
            <h2 className="text-lg font-semibold text-primary">
              Cashback Rules
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm">User (%)</span>
                <Input
                  type="number"
                  value={userRate}
                  onChange={(e) => setUserRate(e.target.value)}
                />
              </label>
              <label>
                <span className="mb-1.5 block text-sm">Platform (%)</span>
                <Input
                  type="number"
                  value={platformRate}
                  onChange={(e) => setPlatformRate(e.target.value)}
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm">
                  Minimum withdrawal (chưa áp dụng)
                </span>
                <Input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  placeholder="Chưa cấu hình"
                />
              </label>
            </div>
            <Button className="mt-5" onClick={save}>
              Lưu rules
            </Button>
          </Card>
          <Card className="bg-danger-soft">
            <div className="flex gap-3 text-danger">
              <ShieldAlert className="shrink-0" />
              <div>
                <h2 className="font-semibold">Thay đổi nhạy cảm</h2>
                <p className="mt-2 text-sm leading-6">
                  API keys không được hiển thị hoặc rotate trong browser. Chức
                  năng này sẽ cần backend riêng và re-authentication.
                </p>
              </div>
            </div>
          </Card>
        </div>
        <Card>
          <h2 className="font-semibold">Provider integrations</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <span>Shopee Affiliate</span>
              <StatusBadge status="COMPLETED" />
            </div>
            <div className="flex items-center justify-between rounded-xl border p-4">
              <span>Saffi Reconciliation</span>
              <StatusBadge status="PROCESSING" />
            </div>
          </div>
        </Card>
      </MockGate>
    </Page>
  );
}
