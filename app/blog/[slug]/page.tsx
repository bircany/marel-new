import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { absoluteUrl } from "@/app/lib/site";
import { getAnnouncementBySlug, listAnnouncements } from "@/db";
import { DEFAULT_BLOG_POSTS } from "@/app/data/default-blogs";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getAnnouncementBySlug(slug);

  if (!post) {
    return { title: "Blog Yazısı Bulunamadı - Marel Plise Perde" };
  }

  const postUrl = absoluteUrl(`/blog/${post.slug}`);
  const imageUrl = absoluteUrl(post.imageUrl || "/images/catalog/diamond.webp");

  return {
    title: `${post.title} | Marel Plise Perde Blog`,
    description: post.summary,
    alternates: {
      canonical: postUrl,
    },
    keywords: [
      "plise perde",
      "plise perde ölçüsü nasıl alınır",
      "cam balkon plise perde",
      "whatsapp ölçü desteği",
      "elbistan plise perde",
      "kahramanmaraş plise perde",
      "honeycomb perde",
      "ısı yalıtımlı perde",
      "yapıştırmalı plise perde",
      "vidalı plise perde",
    ],
    authors: [{ name: "Marel Plise Perde Teknik Ekibi" }],
    openGraph: {
      title: post.title,
      description: post.summary,
      url: postUrl,
      type: "article",
      publishedTime: post.publishedAt || post.createdAt,
      authors: ["Marel Plise Perde"],
      siteName: "Marel Plise Perde",
      locale: "tr_TR",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [imageUrl],
    },
    other: {
      "geo.region": "TR-46",
      "geo.placename": "Elbistan, Kahramanmaraş",
      "geo.position": "38.2056;37.1983",
      "ICBM": "38.2056, 37.1983",
    },
  };
}

function renderInlineText(text: string): React.ReactNode[] {
  // Parses **bold**, *italic*, and [link](url)
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} style={{ fontWeight: 700, color: "#0f172a" }}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target={linkMatch[2].startsWith("http") ? "_blank" : undefined}
            rel={linkMatch[2].startsWith("http") ? "noreferrer" : undefined}
            style={{ color: "#d97706", fontWeight: 600, textDecoration: "underline" }}
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

function renderMarkdownBody(body: string) {
  const lines = body.split("\n");
  const elements: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    // Skip empty lines
    if (!line) {
      index++;
      continue;
    }

    // Horizontal Rule
    if (line === "---" || line === "***") {
      elements.push(
        <hr
          key={`hr-${index}`}
          style={{
            margin: "40px 0",
            border: "none",
            borderTop: "1px solid #e2e8f0",
          }}
        />
      );
      index++;
      continue;
    }

    // Custom WhatsApp CTA box: [whatsapp-cta:ButtonText|PrefillMessage]
    if (line.startsWith("[whatsapp-cta:") && line.endsWith("]")) {
      const payload = line.slice("[whatsapp-cta:".length, -1);
      const [ctaTitle, ctaMsg] = payload.split("|");
      const buttonLabel = ctaTitle?.trim() || "WhatsApp ile Fotoğraf Gönderin";
      const prefill = ctaMsg?.trim() || "Merhaba, plise perde ölçü desteği almak istiyorum.";

      elements.push(
        <div
          key={`wacta-${index}`}
          style={{
            background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
            borderRadius: 16,
            padding: "32px 24px",
            color: "#ffffff",
            margin: "36px 0",
            boxShadow: "0 14px 28px -6px rgba(5, 150, 105, 0.25)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.15)",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: "0.82rem",
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 0 1-1.25-4.38c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.11 8.11 0 0 1 2.39 5.77c0 4.5-3.66 8.16-8.16 8.16zm4.47-6.1c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.53.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.29z" />
            </svg>
            Ücretsiz WhatsApp Ölçü & Danışma
          </div>

          <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: "#ffffff", lineHeight: 1.3 }}>
            {buttonLabel}
          </h3>

          <p style={{ margin: 0, maxWidth: 560, fontSize: "0.98rem", color: "#d1fae5", lineHeight: 1.6 }}>
            Pencerenizin genel ve fitil açılarından fotoğrafını gönderin; teknik ekibimiz çıta derinliğini, montaj şeklini ve net milimetrik ölçülerinizi hemen hesaplasın.
          </p>

          <a
            href={`https://wa.me/905467356602?text=${encodeURIComponent(prefill)}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#22c55e",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "1.05rem",
              padding: "14px 30px",
              borderRadius: 999,
              textDecoration: "none",
              boxShadow: "0 6px 18px rgba(34, 197, 94, 0.45)",
              marginTop: 6,
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 0 1-1.25-4.38c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.11 8.11 0 0 1 2.39 5.77c0 4.5-3.66 8.16-8.16 8.16zm4.47-6.1c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.53.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.29z" />
            </svg>
            <span>Hemen WhatsApp'tan Gönderin (0546 735 66 02)</span>
          </a>
        </div>
      );
      index++;
      continue;
    }

    // Table Parsing: starts and ends with |
    if (line.startsWith("|") && line.endsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|") && lines[index].trim().endsWith("|")) {
        tableLines.push(lines[index].trim());
        index++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        // line 1 is separator | :--- | :--- |
        const bodyRows = tableLines.slice(2).map((rowLine) =>
          rowLine
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim())
        );

        elements.push(
          <div
            key={`table-${index}`}
            style={{
              overflowX: "auto",
              margin: "32px 0",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              background: "#ffffff",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ background: "#0f172a", color: "#ffffff" }}>
                  {headerCells.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      style={{
                        padding: "16px 20px",
                        fontWeight: 700,
                        borderBottom: "3px solid #eab308",
                        letterSpacing: "0.02em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {renderInlineText(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    style={{
                      background: rIdx % 2 === 0 ? "#ffffff" : "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: "14px 20px", color: "#334155", lineHeight: 1.6 }}>
                        {renderInlineText(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Heading 2: ##
    if (line.startsWith("## ")) {
      const headingText = line.slice(3).trim();
      elements.push(
        <h2
          key={`h2-${index}`}
          style={{
            fontSize: "1.85rem",
            fontWeight: 900,
            color: "#0f172a",
            marginTop: "48px",
            marginBottom: "16px",
            lineHeight: 1.3,
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderLeft: "4px solid #eab308",
            paddingLeft: 14,
          }}
        >
          {renderInlineText(headingText)}
        </h2>
      );
      index++;
      continue;
    }

    // Heading 3: ###
    if (line.startsWith("### ")) {
      const headingText = line.slice(4).trim();
      elements.push(
        <h3
          key={`h3-${index}`}
          style={{
            fontSize: "1.35rem",
            fontWeight: 800,
            color: "#1e293b",
            marginTop: "32px",
            marginBottom: "12px",
            lineHeight: 1.4,
          }}
        >
          {renderInlineText(headingText)}
        </h3>
      );
      index++;
      continue;
    }

    // Unordered List item: - or *
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems: string[] = [];
      while (
        index < lines.length &&
        (lines[index].trim().startsWith("- ") || lines[index].trim().startsWith("* "))
      ) {
        listItems.push(lines[index].trim().slice(2));
        index++;
      }
      elements.push(
        <ul
          key={`ul-${index}`}
          style={{
            margin: "20px 0",
            paddingLeft: "24px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              style={{
                color: "#334155",
                fontSize: "1.05rem",
                lineHeight: 1.7,
              }}
            >
              {renderInlineText(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered List item: 1. 2. etc
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (index < lines.length && /^\d+\.\s/.test(lines[index].trim())) {
        const itemLine = lines[index].trim();
        const content = itemLine.replace(/^\d+\.\s/, "");
        listItems.push(content);
        index++;
      }
      elements.push(
        <ol
          key={`ol-${index}`}
          style={{
            margin: "20px 0",
            paddingLeft: "24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              style={{
                color: "#334155",
                fontSize: "1.05rem",
                lineHeight: 1.7,
              }}
            >
              {renderInlineText(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Callout / Blockquote: >
    if (line.startsWith("> ")) {
      const quoteText = line.slice(2).trim();
      elements.push(
        <blockquote
          key={`quote-${index}`}
          style={{
            margin: "24px 0",
            padding: "16px 20px",
            background: "#f1f5f9",
            borderLeft: "4px solid #0284c7",
            borderRadius: "0 8px 8px 0",
            color: "#334155",
            fontSize: "1.05rem",
            fontStyle: "italic",
            lineHeight: 1.7,
          }}
        >
          {renderInlineText(quoteText)}
        </blockquote>
      );
      index++;
      continue;
    }

    // Default Paragraph
    elements.push(
      <p
        key={`p-${index}`}
        style={{
          marginBottom: "1.4rem",
          lineHeight: 1.85,
          color: "#334155",
          fontSize: "1.1rem",
        }}
      >
        {renderInlineText(line)}
      </p>
    );
    index++;
  }

  return elements;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getAnnouncementBySlug(slug);

  if (!post) {
    notFound();
  }

  // Fetch other posts for recommendation cards
  const allPosts = await listAnnouncements(true);
  const otherPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const dateStr = post.publishedAt || post.createdAt;
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const postUrl = absoluteUrl(`/blog/${post.slug}`);
  const imageUrl = absoluteUrl(post.imageUrl || "/images/catalog/diamond.webp");

  // JSON-LD Structured Data for SEO / GEO / AEO
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    image: [imageUrl],
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    author: {
      "@type": "Organization",
      name: "Marel Plise Perde Teknik Ekibi",
      url: "https://www.marelpliseperde.com.tr",
    },
    publisher: {
      "@type": "Organization",
      name: "Marel Plise Perde ve Sineklik Sistemleri",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/marel-logo.png"),
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Elbistan",
        addressRegion: "Kahramanmaraş",
        addressCountry: "TR",
      },
    },
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: "https://www.marelpliseperde.com.tr",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://www.marelpliseperde.com.tr/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  const renderedContent = renderMarkdownBody(post.body);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <SiteHeader />

      <main className="blog-post-detail-main" style={{ minHeight: "80vh", background: "#f8fafc", paddingBottom: 80 }}>
        {/* Breadcrumbs */}
        <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "14px 20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", fontSize: "0.88rem", color: "#64748b", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#475569", textDecoration: "none" }}>Ana Sayfa</Link>
            <span>/</span>
            <Link href="/blog" style={{ color: "#475569", textDecoration: "none" }}>Blog</Link>
            <span>/</span>
            <span style={{ color: "#0f172a", fontWeight: 600 }}>{post.title}</span>
          </div>
        </div>

        {/* Hero Section */}
        <header
          style={{
            position: "relative",
            width: "100%",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            padding: "60px 20px 80px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.18,
            }}
          >
            <Image
              src={post.imageUrl || "/images/catalog/diamond.webp"}
              alt=""
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>

          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <span
                style={{
                  background: "#eab308",
                  color: "#0f172a",
                  fontWeight: 800,
                  fontSize: "0.78rem",
                  padding: "4px 12px",
                  borderRadius: 999,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Marel Blog Rehberi
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#e2e8f0",
                  fontSize: "0.82rem",
                  padding: "4px 12px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                5 dk okuma
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                fontWeight: 900,
                lineHeight: 1.25,
                marginBottom: 20,
                color: "#ffffff",
                textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              {post.title}
            </h1>

            <p
              style={{
                fontSize: "1.15rem",
                lineHeight: 1.7,
                color: "#cbd5e1",
                maxWidth: 820,
                marginBottom: 24,
              }}
            >
              {post.summary}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: "0.9rem",
                color: "#94a3b8",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                paddingTop: 16,
              }}
            >
              <span>Yazar: <strong>Marel Plise Perde Teknik Ekibi</strong></span>
              <span>•</span>
              <time dateTime={dateStr}>{formattedDate}</time>
            </div>
          </div>
        </header>

        {/* Article Container */}
        <div style={{ maxWidth: 900, margin: "-40px auto 0", padding: "0 20px", position: "relative", zIndex: 10 }}>
          <article
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: "48px clamp(20px, 6vw, 56px)",
              boxShadow: "0 10px 30px -5px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* AEO Quick Answer Box */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 12,
                padding: "20px 24px",
                marginBottom: 36,
                display: "flex",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#16a34a",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontWeight: 900,
                }}
              >
                ✓
              </div>
              <div>
                <strong style={{ color: "#166534", fontSize: "1rem", display: "block", marginBottom: 4 }}>
                  Hızlı Rehber (Özet Yanıt):
                </strong>
                <p style={{ margin: 0, color: "#14532d", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  Plise perde ölçüsü cam çıtasının (fitilinin) içinden milimetrik olarak alınır. En ölçüsü camın üst, orta ve altından ölçülüp en küçük değer seçilir. Tereddüt ettiğiniz her pencere için <strong>0546 735 66 02</strong> numaralı WhatsApp hattımıza pencere fotoğrafı ileterek uzmanımızla birlikte sıfır hatayla sipariş verebilirsiniz.
                </p>
              </div>
            </div>

            {/* Rendered Body */}
            <div className="blog-article-body">
              {renderedContent}
            </div>

            {/* Author Signature & Warranty Card */}
            <div
              style={{
                marginTop: 60,
                padding: "24px",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "#0f172a",
                  color: "#eab308",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}
              >
                MRL
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.05rem", fontWeight: 800 }}>
                  Marel Plise Perde Teknik Destek Merkezi
                </h4>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.88rem", lineHeight: 1.5 }}>
                  Elbistan / Kahramanmaraş fabrikamızda özel üretim plise perde, honeycomb ısı yalıtımlı perdeler ve pileli sineklik sistemleri. Türkiye geneli sigortalı ücretsiz kargo.
                </p>
              </div>
              <a
                href="https://wa.me/905467356602"
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Danışmanla Görüş ↗
              </a>
            </div>

            {/* Back to Blog Button */}
            <div style={{ marginTop: 40, textAlign: "center" }}>
              <Link
                href="/blog"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#0f172a",
                  background: "#f1f5f9",
                  padding: "12px 28px",
                  borderRadius: 999,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Tüm Blog Yazılarına Dön
              </Link>
            </div>
          </article>

          {/* Related Articles */}
          {otherPosts.length > 0 && (
            <section style={{ marginTop: 60 }}>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>
                İlginizi Çekebilecek Diğer Rehberler
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
                {otherPosts.map((related) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    style={{
                      background: "#ffffff",
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <div style={{ position: "relative", height: 160, width: "100%", background: "#e2e8f0" }}>
                      <Image
                        unoptimized
                        src={related.imageUrl || "/images/catalog/diamond.webp"}
                        alt={related.title}
                        fill
                        sizes="300px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h4
                        style={{
                          margin: "0 0 8px",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#0f172a",
                          lineHeight: 1.4,
                        }}
                      >
                        {related.title}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.85rem",
                          color: "#64748b",
                          lineHeight: 1.5,
                          flex: 1,
                        }}
                      >
                        {related.summary.slice(0, 100)}...
                      </p>
                      <span
                        style={{
                          marginTop: 12,
                          color: "#d97706",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        Devamını Oku →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
