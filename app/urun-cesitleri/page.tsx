import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { absoluteUrl } from "@/app/lib/site";
import { YAREN_SERIES_LIST } from "@/app/data/yaren-series";

export const metadata = {
  title: "Ürün Çeşitlerimiz | Marel Plise Perde",
  description:
    "Diamond, Touch, New, Tülle, Efe, Ece, Blackout, Honeycomb, Dark, Bambu, Silver ve Gold serisi plise perde çeşitlerimizi inceleyin.",
  openGraph: {
    title: "Ürün Çeşitlerimiz - Marel Plise Perde",
    description: "Ölçüye özel plise perde model ve serileri.",
    url: absoluteUrl("/urun-cesitleri"),
    siteName: "Marel Plise Perde",
  },
};

export default function UrunCesitleriPage() {
  return (
    <>
      <SiteHeader />

      <main style={{ backgroundColor: "#fbfaf6", minHeight: "100vh", paddingBottom: "100px" }}>
        
        {/* Top Series Buttons Section */}
        <section style={{ padding: "40px 20px 20px", maxWidth: "1240px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
              justifyContent: "center",
              marginBottom: "30px",
            }}
          >
            {YAREN_SERIES_LIST.map((series) => (
              <a
                key={series.id}
                href={`#${series.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#b8904f",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  textAlign: "center",
                  transition: "background-color 0.2s, transform 0.15s",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
                }}
                className="hover:bg-[#9f7838] hover:-translate-y-0.5"
              >
                {series.title.replace(" SERIES", " Series").replace(" SERİES", " Series")}
              </a>
            ))}
          </div>
        </section>

        {/* Series Showcase Sections */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px" }}>
          {YAREN_SERIES_LIST.map((series) => (
            <section
              key={series.id}
              id={series.id}
              style={{
                marginBottom: "60px",
                scrollMarginTop: "100px",
              }}
            >
              {/* Series Title */}
              <div style={{ textAlign: "center", marginBottom: "25px" }}>
                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 400,
                    letterSpacing: "0.15em",
                    color: "#1e293b",
                    textTransform: "uppercase",
                    fontFamily: "serif",
                  }}
                >
                  {series.title}
                </h2>
              </div>

              {/* Items Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "20px",
                }}
              >
                {series.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.slug ? `/urunler/${item.slug}` : "/urunler"}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "#ffffff",
                      borderRadius: "16px",
                      overflow: "hidden",
                      textDecoration: "none",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
                      border: "1px solid #edebe4",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    className="group hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Image Box */}
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16 / 11",
                        backgroundColor: "#f5f5f2",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={item.image}
                        alt={item.code || item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Bottom Caption Tag */}
                    <div
                      style={{
                        padding: "12px 14px",
                        textAlign: "center",
                        backgroundColor: "#ffffff",
                        borderTop: "1px solid #f1f0ea",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          color: "#1e293b",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.code || item.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
