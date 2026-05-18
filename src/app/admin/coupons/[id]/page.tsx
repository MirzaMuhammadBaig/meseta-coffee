import { notFound, redirect } from "next/navigation";
import PageHeading from "@/components/admin/PageHeading";
import CouponForm from "@/components/admin/CouponForm";
import { deleteCoupon, getCoupon, updateCoupon } from "@/lib/admin/coupons";

export const metadata = { title: "Edit coupon" };

export default async function EditCouponPage({
  params,
}: {
  params: { id: string };
}) {
  const coupon = await getCoupon(params.id);
  if (!coupon) notFound();

  async function onSave(fd: FormData) {
    "use server";
    await updateCoupon(params.id, fd);
  }
  async function onDelete() {
    "use server";
    await deleteCoupon(params.id);
    redirect("/admin/coupons");
  }

  return (
    <>
      <PageHeading
        eyebrow="Promotions → Coupons"
        title={coupon.code}
        description={`Used ${coupon.uses_count} time${coupon.uses_count === 1 ? "" : "s"}.`}
      />
      <CouponForm coupon={coupon} onSave={onSave} onDelete={onDelete} />
    </>
  );
}
