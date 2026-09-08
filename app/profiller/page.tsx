import { CategoryAliasPage } from "@/app/components/category-alias-page";

export const revalidate = 60;
export const metadata = {
  title: "Profiller | Marel Perde ve Sineklik Sistemleri",
  description: "Perde ve sineklik sistemlerinde kullanılan dayanıklı alüminyum profil seçenekleri ve renkleri.",
};

export default function Page() {
  return <CategoryAliasPage slug="profiller" />;
}
