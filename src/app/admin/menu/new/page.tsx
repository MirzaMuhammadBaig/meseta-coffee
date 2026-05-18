import PageHeading from "@/components/admin/PageHeading";
import MenuItemForm from "@/components/admin/MenuItemForm";
import { createMenuItem, listCategories } from "@/lib/admin/menu";

export const metadata = { title: "New menu item" };

export default async function NewMenuItemPage() {
  const categories = await listCategories();
  return (
    <>
      <PageHeading
        eyebrow="Catalog → Menu"
        title="New menu item"
        description="Add a drink, sandwich, dessert, or anything else to the menu."
      />
      <MenuItemForm categories={categories} onSave={createMenuItem} />
    </>
  );
}
