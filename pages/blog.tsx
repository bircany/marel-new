import { useEffect, useState } from "react";
import BlogPage from "@/components/page-views/blog";

/** Blog listesi yalnızca merkezi API'den okunur; sayfa DB modülü import etmez. */
export default function BlogRoute() {
  const [blogPosts, setBlogPosts] = useState<unknown[]>([]);

  useEffect(() => {
    fetch("/api/announcements")
      .then((response) => (response.ok ? response.json() : { announcements: [] }))
      .then((payload) => setBlogPosts(payload.announcements ?? []))
      .catch(() => setBlogPosts([]));
  }, []);

  return <BlogPage blogPosts={blogPosts as any[]} />;
}



