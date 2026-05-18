import { notFound, redirect } from "next/navigation";
import PageHeading from "@/components/admin/PageHeading";
import DealForm from "@/components/admin/DealForm";
import { deleteDeal, getDeal, updateDeal } from "@/lib/admin/deals";

export const metadata = { title: "Edit deal" };

export default async function EditDealPage({
  params,
}: {
  params: { id: string };
}) {
  const deal = await getDeal(params.id);
  if (!deal) notFound();

  async function onSave(fd: FormData) {
    "use server";
    await updateDeal(params.id, fd);
  }
  async function onDelete() {
    "use server";
    await deleteDeal(params.id);
    redirect("/admin/deals");
  }

  return (
    <>
      <PageHeading
        eyebrow="Promotions → Deals"
        title={deal.title}
      />
      <DealForm deal={deal} onSave={onSave} onDelete={onDelete} />
    </>
  );
}
