import { notFound } from "next/navigation";
import { CustomerProductPage } from "@/modules/products/components/customer-product-page";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { itemId } = await params;
  if (!/^[1-9]\d{0,18}$/.test(itemId) || BigInt(itemId) > 9223372036854775807n) notFound();
  const { order } = await searchParams;
  const backHref =
    order && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order)
      ? `/app/orders/${order}`
      : "/app/orders";
  return <CustomerProductPage key={itemId} itemId={itemId} backHref={backHref} />;
}
