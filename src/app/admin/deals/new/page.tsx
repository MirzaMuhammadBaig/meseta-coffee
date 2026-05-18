import PageHeading from "@/components/admin/PageHeading";
import DealForm from "@/components/admin/DealForm";
import { createDeal } from "@/lib/admin/deals";

export const metadata = { title: "New deal" };

export default function NewDealPage() {
  return (
    <>
      <PageHeading
        eyebrow="Promotions → Deals"
        title="New deal"
        description="A scheduled promotion that highlights specific items or the whole menu."
      />
      <DealForm onSave={createDeal} />
    </>
  );
}
