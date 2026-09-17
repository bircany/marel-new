import type { GetStaticProps, InferGetStaticPropsType } from "next";
import BlogPage from "@/app/components/page-views/blog";

export const getStaticProps: GetStaticProps<{ blogPosts: unknown[] }> = async () => {
  try {
    const { listAnnouncements } = await import("@/db");
    const blogPosts = await listAnnouncements(true);
    return { props: { blogPosts: JSON.parse(JSON.stringify(blogPosts)) }, revalidate: 60 };
  } catch {
    return { props: { blogPosts: [] }, revalidate: 30 };
  }
};

export default function BlogRoute({ blogPosts }: InferGetStaticPropsType<typeof getStaticProps>) {
  return <BlogPage blogPosts={blogPosts as any[]} />;
}


