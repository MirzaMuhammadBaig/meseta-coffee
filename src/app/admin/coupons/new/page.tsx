import PageHeading from "@/components/admin/PageHeading";
import CouponForm from "@/components/admin/CouponForm";
import { createCoupon } from "@/lib/admin/coupons";

export const metadata = { title: "New coupon" };

export default function NewCouponPage() {
  return (
    <>
      <PageHeading
        eyebrow="Promotions → Coupons"
        title="New coupon"
        description="Generate a code customers can redeem at checkout."
      />
      <CouponForm onSave={createCoupon} />
    </>
  );
}
