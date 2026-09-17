import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1200, 1440],
    imageSizes: [96, 160, 240, 320, 480, 640],
  },
  async redirects() {
    return [
      { source: "/pages/iletisim", destination: "/iletisim", permanent: true },
      { source: "/pages/mesafeli-satis-sozlesmesi", destination: "/mesafeli-satis-sozlesmesi", permanent: true },
      { source: "/pages/gizlilikguvenlikpolitikasi", destination: "/gizlilik-politikasi", permanent: true },
      { source: "/pages/tuketici-haklari-cayma-iptal-iade-kosullari", destination: "/iade-ve-iptal-kosullari", permanent: true },
      { source: "/pages/kisisel-veriler-politikasi", destination: "/kvkk-aydinlatma-metni", permanent: true },
      { source: "/pages/cerez-politikasi", destination: "/cerez-politikasi", permanent: true },
    ];
  },
};

export default nextConfig;
