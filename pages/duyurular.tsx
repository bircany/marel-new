import type { GetStaticProps, InferGetStaticPropsType } from "next";
import AnnouncementsPage from "@/components/page-views/duyurular";

export const getStaticProps: GetStaticProps<{ announcements: unknown[] }> = async () => {
  try {
    const { listAnnouncements } = await import("@/db");
    const announcements = await listAnnouncements(true);
    return { props: { announcements: JSON.parse(JSON.stringify(announcements)) }, revalidate: 60 };
  } catch {
    return { props: { announcements: [] }, revalidate: 30 };
  }
};

export default function AnnouncementsRoute({ announcements }: InferGetStaticPropsType<typeof getStaticProps>) {
  return <AnnouncementsPage announcements={announcements as any[]} />;
}



