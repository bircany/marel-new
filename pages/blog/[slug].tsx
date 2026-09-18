import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { absoluteUrl } from "@/lib/site";

export default function BlogDetailPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "";
  const [post, setPost] = useState<any | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/announcements/${encodeURIComponent(slug)}`).then((r) => r.ok ? r.json() : null).then((data) => setPost(data?.announcement || null)).finally(() => setLoaded(true));
  }, [slug]);
  if (!loaded) return <><SiteHeader /><main className="content-page shop-container" style={{ minHeight: "55vh", padding: "80px 20px" }}>Yazı yükleniyor…</main><SiteFooter /></>;
  if (!post) return <><SiteHeader /><main className="content-page shop-container" style={{ minHeight: "55vh", padding: "80px 20px" }}><h1>Yazı bulunamadı</h1><Link href="/blog">Blog'a dön</Link></main><SiteFooter /></>;
  const url = absoluteUrl(`/blog/${post.slug}`);
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.summary, image: post.imageUrl ? [absoluteUrl(post.imageUrl)] : undefined, mainEntityOfPage: url, datePublished: post.publishedAt || post.createdAt, dateModified: post.updatedAt || post.publishedAt || post.createdAt, author: { "@type": "Organization", name: "Marel Plise Perde" }, publisher: { "@type": "Organization", name: "Marel Plise Perde", logo: { "@type": "ImageObject", url: absoluteUrl("/og.png") } } };
  return <><Head><title>{post.title} | Marel Blog</title><meta name="description" content={post.summary} /><link rel="canonical" href={url} /><meta property="og:type" content="article" /><meta property="og:title" content={post.title} /><meta property="og:description" content={post.summary} />{post.imageUrl && <meta property="og:image" content={absoluteUrl(post.imageUrl)} />}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /></Head><SiteHeader /><main className="content-page"><article className="shop-container" style={{ maxWidth: 860, padding: "56px 20px 80px" }}><p className="eyebrow">Marel Blog</p><h1>{post.title}</h1><p style={{ color: "#64748b", fontSize: "1.1rem" }}>{post.summary}</p>{post.imageUrl && <div style={{ position: "relative", height: 420, margin: "28px 0" }}><Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 900px) 100vw, 860px" style={{ objectFit: "cover" }} /></div>}<div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{post.body}</div></article></main><SiteFooter /></>;
}
