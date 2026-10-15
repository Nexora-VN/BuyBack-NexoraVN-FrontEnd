import { WithdrawalDetailPage } from "@/modules/finance/components/user-pages";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WithdrawalDetailPage id={id} />;
}
