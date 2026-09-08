import { ReconciliationDetailPage } from "@/modules/finance/components/admin-pages";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ReconciliationDetailPage id={id} />; }
