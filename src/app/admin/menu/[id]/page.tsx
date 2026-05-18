import { notFound, redirect } from "next/navigation";
import PageHeading from "@/components/admin/PageHeading";
import MenuItemForm from "@/components/admin/MenuItemForm";
import {
  deleteMenuItem,
  getMenuItem,
  listCategories,
  updateMenuItem,
} from "@/lib/admin/menu";

export const metadata = { title: "Edit menu item" };

export default async function EditMenuItemPage({
  params,
}: {
  params: { id: string };
}) {
  const [item, categories] = await Promise.all([
    getMenuItem(params.id),
    listCategories(),
  ]);
  if (!item) notFound();

  async function onSave(fd: FormData) {
    "use server";
    await updateMenuItem(params.id, fd);
  }
  async function onDelete() {
    "use server";
    await deleteMenuItem(params.id);
    redirect("/admin/menu");
  }

  return (
    <>
      <PageHeading
        eyebrow={`Editing · ${item.slug}`}
        title={item.name}
        description="Anything you change here updates the public menu instantly."
      />
      <MenuItemForm
        item={item}
        categories={categories}
        onSave={onSave}
        onDelete={onDelete}
      />
    </>
  );
}
