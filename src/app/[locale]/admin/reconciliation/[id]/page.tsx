import { ReconciliationDetailPage } from "@/modules/mock/components/admin-pages";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ReconciliationDetailPage id={id} />; }
