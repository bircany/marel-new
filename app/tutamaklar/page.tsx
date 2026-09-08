import { CategoryAliasPage } from "@/app/components/category-alias-page";

export const revalidate = 60;
export const metadata = { title: "Tutamaklar | Marel" };

export default function Page() {
  return <CategoryAliasPage slug="tutamaklar" />;
}
