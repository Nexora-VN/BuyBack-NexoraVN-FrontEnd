"use client";

import {
  ArrowDownToLine,
  ArrowRight,
  Banknote,
  Check,
  CircleDollarSign,
  Copy,
  CreditCard,
  History,
  Link2,
  PackageSearch,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, MockBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { EmptyState, Page } from "@/components/ui/page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatDateTime, formatVnd } from "@/lib/format";
import { useAuth } from "@/modules/auth/components/auth-provider";
import { MockGate } from "@/modules/mock/components/mock-gate";
import { useMockDatabase } from "@/modules/mock/hooks/use-mock-database";

export function UserDashboardPage() {
  const { data, reset } = useMockDatabase();
  const { user } = useAuth();
  const available = data.ledger.reduce((sum, item) => sum + item.amount, 0);
  return (
    <Page
      title={`Xin chào, ${user?.email.split("@")[0] ?? "bạn"}`}
      description="Theo dõi cashback Shopee của bạn trong một nơi."
      badge={<MockBadge />}
      actions={
        <Button
          variant="outline"
          onClick={() => {
            reset();
            toast.success("Đã đặt lại dữ liệu mẫu");
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
            label="Cashback khả dụng"
            value={formatVnd(available)}
            icon={<WalletCards />}
          />
          <StatCard
            label="Đang chờ đối soát"
            value={formatVnd(
              data.orders
                .filter((o) => o.status === "PENDING")
                .reduce((s, o) => s + o.cashback, 0),
            )}
            icon={<History />}
          />
          <StatCard
            label="Tổng đơn hàng"
            value={data.orders.length}
            icon={<ShoppingBag />}
          />
          <StatCard
            label="Link đã tạo"
            value={data.links.length}
            icon={<Link2 />}
          />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
              <Link
                href="/app/orders"
                className="text-sm font-medium text-primary"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {data.orders.slice(0, 3).map((order) => (
                <Link
                  href={`/app/orders/${order.id}`}
                  key={order.id}
                  className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-muted"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                    <PackageSearch />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {order.product}
                    </p>
                    <p className="text-xs text-muted-foreground">#{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      +{formatVnd(order.cashback)}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Thao tác nhanh</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                [
                  "/app/links/new",
                  Link2,
                  "Tạo link cashback",
                  "Dán link Shopee và nhận link mới",
                ],
                [
                  "/app/withdrawals/new",
                  ArrowDownToLine,
                  "Rút tiền",
                  "Tạo yêu cầu chuyển khoản",
                ],
                ["/app/links", History, "Lịch sử link", "Xem các link đã tạo"],
              ].map(([href, Icon, title, desc]) => {
                const C = Icon as typeof Link2;
                return (
                  <Link
                    key={String(href)}
                    href={String(href)}
                    className="card-hover flex items-center gap-3 rounded-xl border p-4"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                      <C />
                    </span>
                    <div>
                      <p className="font-semibold">{String(title)}</p>
                      <p className="text-xs text-muted-foreground">
                        {String(desc)}
                      </p>
                    </div>
                    <ArrowRight className="ml-auto size-4" />
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </MockGate>
    </Page>
  );
}

export function LinkHistoryPage() {
  const { data } = useMockDatabase();
  const [search, setSearch] = useState("");
  const rows = data.links.filter((item) =>
    `${item.product} ${item.id} ${item.sourceUrl}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <Page
      title="Lịch sử tạo link"
      description="Link được tạo thật được lưu bổ sung ở đây; endpoint lịch sử cho USER chưa có."
      badge={<MockBadge />}
      actions={
        <Button asChild>
          <Link href="/app/links/new">
            <Plus />
            Tạo link mới
          </Link>
        </Button>
      }
    >
      <MockGate>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Tìm theo sản phẩm hoặc link"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((item) => (
            <Card key={item.id} className="card-hover">
              <div className="flex items-start justify-between gap-3">
                <Badge variant="success">Hoạt động</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>
              <h2 className="mt-4 line-clamp-2 font-semibold">
                {item.product}
              </h2>
              <p className="mt-3 line-clamp-2 break-all rounded-lg bg-muted p-2 text-xs text-muted-foreground">
                {item.affiliateUrl}
              </p>
              <Button
                className="mt-4 w-full"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(item.affiliateUrl);
                  toast.success("Đã sao chép link");
                }}
              >
                <Copy />
                Sao chép
              </Button>
            </Card>
          ))}
          {!rows.length && (
            <EmptyState
              title="Không có kết quả"
              description="Hãy thử một từ khóa khác."
            />
          )}
        </div>
      </MockGate>
    </Page>
  );
}

export function UserOrdersPage() {
  const { data } = useMockDatabase();
  const [status, setStatus] = useState("");
  const rows = data.orders.filter((row) => !status || row.status === status);
  return (
    <Page
      title="Đơn hàng của tôi"
      description="Đơn hàng Shopee được ghi nhận và cập nhật theo dữ liệu đối soát."
      badge={<MockBadge />}
    >
      <MockGate>
        <Select
          className="max-w-56"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ đối soát</option>
          <option value="AVAILABLE">Khả dụng</option>
          <option value="REJECTED">Từ chối</option>
        </Select>
        <div className="space-y-3">
          {rows.map((order) => (
            <Link href={`/app/orders/${order.id}`} key={order.id}>
              <Card className="card-hover mb-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <ShoppingBag />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="line-clamp-1 font-semibold">
                          {order.product}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.shop} · #{order.id}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="mt-4 flex justify-between border-t pt-3 text-sm">
                      <span>{formatVnd(order.amount)}</span>
                      <span className="font-semibold text-primary">
                        Cashback +{formatVnd(order.cashback)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </MockGate>
    </Page>
  );
}

export function UserOrderDetailPage({ id }: { id: string }) {
  const { data } = useMockDatabase();
  const order = data.orders.find((item) => item.id === id);
  return (
    <Page
      title="Chi tiết đơn hàng"
      description={order ? `#${order.id}` : "Đơn hàng không tồn tại"}
      badge={<MockBadge />}
    >
      <MockGate>
        {!order ? (
          <EmptyState
            title="Không tìm thấy đơn hàng"
            description="Kiểm tra lại mã đơn hàng."
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <Card>
              <div className="flex items-start gap-4">
                <span className="grid size-16 place-items-center rounded-2xl bg-secondary text-primary">
                  <ShoppingBag className="size-8" />
                </span>
                <div>
                  <p className="font-semibold">{order.product}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.shop}
                  </p>
                  <p className="mt-2 text-sm">
                    Giá trị: <strong>{formatVnd(order.amount)}</strong>
                  </p>
                </div>
              </div>
              <div className="mt-6 border-t pt-5">
                <h2 className="font-semibold">Tiến trình đối soát</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Ghi nhận", true],
                    ["Provider xác nhận", order.status !== "PENDING"],
                    ["Cashback khả dụng", order.status === "AVAILABLE"],
                  ].map(([label, done]) => (
                    <div
                      key={String(label)}
                      className={`rounded-xl border p-3 text-sm ${done ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`}
                    >
                      <Check className="mb-2 size-5" />
                      {String(label)}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            <Card className="h-fit">
              <h2 className="font-semibold">Phân bổ commission</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt>Commission provider</dt>
                  <dd>{formatVnd(order.commission)}</dd>
                </div>
                <div className="flex justify-between text-primary">
                  <dt>Cashback của bạn (85%)</dt>
                  <dd className="font-bold">{formatVnd(order.cashback)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Nền tảng (15%)</dt>
                  <dd>{formatVnd(order.commission - order.cashback)}</dd>
                </div>
              </dl>
              <div className="mt-5">
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Cashback chỉ khả dụng khi provider xác nhận commission đã thanh
                toán; không áp dụng mốc ngày cố định.
              </p>
            </Card>
          </div>
        )}
      </MockGate>
    </Page>
  );
}

export function CashbackPage() {
  const { data } = useMockDatabase();
  const total = data.orders.reduce((sum, item) => sum + item.cashback, 0);
  const available = data.orders
    .filter((item) => item.status === "AVAILABLE")
    .reduce((sum, item) => sum + item.cashback, 0);
  return (
    <Page
      title="Cashback của tôi"
      description="Theo dõi khoản hoàn tiền theo trạng thái đối soát."
      badge={<MockBadge />}
    >
      <MockGate>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Tổng cashback"
            value={formatVnd(total)}
            icon={<CircleDollarSign />}
          />
          <StatCard
            label="Khả dụng"
            value={formatVnd(available)}
            icon={<WalletCards />}
          />
          <StatCard
            label="Đang chờ"
            value={formatVnd(total - available)}
            icon={<History />}
          />
        </div>
        <DataTable
          rows={data.orders}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "order",
              label: "Đơn hàng",
              render: (row) => (
                <div>
                  <p className="font-medium">{row.product}</p>
                  <p className="text-xs text-muted-foreground">#{row.id}</p>
                </div>
              ),
            },
            {
              key: "commission",
              label: "Commission",
              className: "text-right",
              render: (row) => formatVnd(row.commission),
            },
            {
              key: "formula",
              label: "Phân bổ",
              render: () => "85% user · 15% platform",
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
              label: "Trạng thái",
              render: (row) => <StatusBadge status={row.status} />,
            },
          ]}
        />
      </MockGate>
    </Page>
  );
}

export function WalletPage() {
  const { data } = useMockDatabase();
  const balance = data.ledger.reduce((sum, item) => sum + item.amount, 0);
  return (
    <Page
      title="Ví BuyBack"
      description="Ledger là nguồn dữ liệu gốc của mọi thay đổi số dư."
      badge={<MockBadge />}
      actions={
        <Button asChild>
          <Link href="/app/withdrawals/new">
            <ArrowDownToLine />
            Rút tiền
          </Link>
        </Button>
      }
    >
      <MockGate>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Số dư khả dụng"
            value={formatVnd(balance)}
            icon={<WalletCards />}
          />
          <StatCard
            label="Đang xử lý"
            value={formatVnd(
              data.withdrawals
                .filter((w) => w.status === "PROCESSING")
                .reduce((s, w) => s + w.amount, 0),
            )}
            icon={<History />}
          />
          <StatCard
            label="Đã rút"
            value={formatVnd(
              data.withdrawals
                .filter((w) => w.status === "COMPLETED")
                .reduce((s, w) => s + w.amount, 0),
            )}
            icon={<Banknote />}
          />
        </div>
        <Card>
          <div className="flex justify-between">
            <h2 className="font-semibold">Giao dịch gần đây</h2>
            <Link href="/app/withdrawals" className="text-sm text-primary">
              Lịch sử rút tiền
            </Link>
          </div>
          <div className="mt-4 divide-y">
            {data.ledger.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                  <CreditCard />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.reference}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <strong
                  className={item.amount >= 0 ? "text-success" : "text-danger"}
                >
                  {item.amount >= 0 ? "+" : ""}
                  {formatVnd(item.amount)}
                </strong>
              </div>
            ))}
          </div>
        </Card>
      </MockGate>
    </Page>
  );
}

export function NewWithdrawalPage() {
  const { update } = useMockDatabase();
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("Vietcombank");
  const [account, setAccount] = useState("");
  const submit = () => {
    const value = Number(amount);
    if (!Number.isInteger(value) || value <= 0 || !account.trim()) {
      toast.error("Nhập số tiền nguyên dương và tài khoản ngân hàng");
      return;
    }
    update((db) => ({
      ...db,
      withdrawals: [
        {
          id: `WDR-${Date.now()}`,
          amount: value,
          bank,
          account: `**** ${account.slice(-4)}`,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
        ...db.withdrawals,
      ],
    }));
    setAmount("");
    setAccount("");
    toast.success("Đã tạo yêu cầu rút tiền mẫu");
  };
  return (
    <Page
      title="Yêu cầu rút tiền"
      description="Admin sẽ chuyển khoản và cập nhật trạng thái thủ công."
      badge={<MockBadge />}
    >
      <MockGate>
        <div className="mx-auto max-w-2xl">
          <Card>
            <div className="grid gap-5">
              <label>
                <span className="mb-2 block text-sm font-medium">
                  Số tiền muốn rút (VND)
                </span>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số nguyên VND"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium">
                  Ngân hàng
                </span>
                <Select value={bank} onChange={(e) => setBank(e.target.value)}>
                  <option>Vietcombank</option>
                  <option>Techcombank</option>
                  <option>MB Bank</option>
                  <option>ACB</option>
                </Select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium">
                  Số tài khoản
                </span>
                <Input
                  inputMode="numeric"
                  value={account}
                  onChange={(e) =>
                    setAccount(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Nhập số tài khoản"
                />
              </label>
              <div className="rounded-xl bg-warning-soft p-3 text-xs leading-5 text-warning">
                Mức tối thiểu, phí và thời gian xử lý sẽ do backend cấu hình
                sau. UI hiện không áp dụng rule giả.
              </div>
              <Button size="lg" onClick={submit}>
                <ArrowDownToLine />
                Gửi yêu cầu
              </Button>
            </div>
          </Card>
        </div>
      </MockGate>
    </Page>
  );
}

export function WithdrawalHistoryPage() {
  const { data } = useMockDatabase();
  return (
    <Page
      title="Lịch sử rút tiền"
      description="Theo dõi các yêu cầu chuyển khoản thủ công."
      badge={<MockBadge />}
    >
      <MockGate>
        <DataTable
          rows={data.withdrawals}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "id",
              label: "Mã yêu cầu",
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
              key: "status",
              label: "Trạng thái",
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "date",
              label: "Ngày tạo",
              render: (row) => formatDateTime(row.createdAt),
            },
          ]}
        />
      </MockGate>
    </Page>
  );
}

export function AccountPage() {
  const { user } = useAuth();
  const [name, setName] = useState("Nguyễn Văn An");
  const [bank, setBank] = useState("Vietcombank · **** 2846");
  return (
    <Page
      title="Tài khoản của tôi"
      description="Identity lấy từ Auth API; hồ sơ và ngân hàng đang dùng dữ liệu mẫu."
      badge={<MockBadge />}
    >
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <Card className="text-center">
          <span className="mx-auto grid size-24 place-items-center rounded-full bg-secondary text-primary">
            <UserRound className="size-11" />
          </span>
          <h2 className="mt-4 font-bold">{name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
          <Badge className="mt-3">{user?.role}</Badge>
        </Card>
        <MockGate>
          <Card>
            <h2 className="font-semibold">Thông tin cá nhân</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm">Tên hiển thị</span>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm">
                  Tài khoản ngân hàng
                </span>
                <Input value={bank} onChange={(e) => setBank(e.target.value)} />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm">Email xác thực</span>
                <Input value={user?.email ?? ""} disabled />
              </label>
            </div>
            <Button
              className="mt-5"
              onClick={() => toast.success("Đã lưu hồ sơ mẫu")}
            >
              Lưu thay đổi
            </Button>
          </Card>
        </MockGate>
      </div>
    </Page>
  );
}
