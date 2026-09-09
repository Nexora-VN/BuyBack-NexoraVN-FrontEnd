import { SettlementDetailPage } from "@/modules/finance/components/admin-pages";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <SettlementDetailPage id={id} />; }
