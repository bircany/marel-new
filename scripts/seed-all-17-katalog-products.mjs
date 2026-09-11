import fs from "fs";
import postgres from "postgres";
import crypto from "crypto";

const envFile = fs.readFileSync(".env.local", "utf8");
let dbUrl = "";
for (const line of envFile.split("\n")) {
  if (line.startsWith("DATABASE_URL=")) {
    dbUrl = line.substring("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
  }
}

if (!dbUrl) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: { rejectUnauthorized: false } });

// 17 Categories with their individual products and colors
const ALL_CATALOG_DATA = [
  // 1. DIAMOND (18 items from _DSC9919.jpg to _DSC9936.jpg)
  {
    category: "Diamond",
    seriesTitle: "Diamond Series",
    seriesSlug: "diamond-series-plise-perde",
    basePrice: 55000,
    items: [
      { name: "Diamond 100 Beyaz Plise Perde", color: "Beyaz", img: "/images/products/dia/_DSC9932.jpg", slug: "diamond-100-beyaz-plise-perde" },
      { name: "Diamond 101 Ekru Plise Perde", color: "Ekru", img: "/images/products/dia/_DSC9936.jpg", slug: "diamond-101-ekru-plise-perde" },
      { name: "Diamond 102 Gri Plise Perde", color: "Gri", img: "/images/products/dia/_DSC9920.jpg", slug: "diamond-102-gri-plise-perde" },
      { name: "Diamond 103 Ara-Gri Plise Perde", color: "Ara-Gri", img: "/images/products/dia/_DSC9933.jpg", slug: "diamond-103-ara-gri-plise-perde" },
      { name: "Diamond 104 Vizon Plise Perde", color: "Vizon", img: "/images/products/dia/_DSC9919.jpg", slug: "diamond-104-vizon-plise-perde" },
      { name: "Diamond 105 Bej Plise Perde", color: "Bej", img: "/images/products/dia/_DSC9925.jpg", slug: "diamond-105-bej-plise-perde" },
      { name: "Diamond 108 Krem Plise Perde", color: "Krem", img: "/images/products/dia/_DSC9926.jpg", slug: "diamond-108-krem-plise-perde" },
      { name: "Diamond 109 Açık Gri Plise Perde", color: "Açık Gri", img: "/images/products/dia/_DSC9929.jpg", slug: "diamond-109-acik-gri-plise-perde" },
      { name: "Diamond 110 Antrasit Plise Perde", color: "Antrasit", img: "/images/products/dia/_DSC9928.jpg", slug: "diamond-110-antrasit-plise-perde" },
      { name: "Diamond 111 Siyah Plise Perde", color: "Siyah", img: "/images/products/dia/_DSC9927.jpg", slug: "diamond-111-siyah-plise-perde" },
      { name: "Diamond 112 Füme Plise Perde", color: "Füme", img: "/images/products/dia/_DSC9934.jpg", slug: "diamond-112-fume-plise-perde" },
      { name: "Diamond 113 Kahve Plise Perde", color: "Kahve", img: "/images/products/dia/_DSC9924.jpg", slug: "diamond-113-kahve-plise-perde" },
      { name: "Diamond Koyu Vizon Plise Perde", color: "Koyu Vizon", img: "/images/products/dia/_DSC9930.jpg", slug: "diamond-koyu-vizon-plise-perde" },
      { name: "Diamond Kırmızı Plise Perde", color: "Kırmızı", img: "/images/products/dia/_DSC9921.jpg", slug: "diamond-kirmizi-plise-perde" },
      { name: "Diamond Sarı Plise Perde", color: "Sarı", img: "/images/products/dia/_DSC9922.jpg", slug: "diamond-sari-plise-perde" },
      { name: "Diamond Mavi Plise Perde", color: "Mavi", img: "/images/products/dia/_DSC9923.jpg", slug: "diamond-mavi-plise-perde" },
      { name: "Diamond Pudra Pembe Plise Perde", color: "Pudra Pembe", img: "/images/products/dia/_DSC9931.jpg", slug: "diamond-pudra-pembe-plise-perde" },
      { name: "Diamond Hardal Plise Perde", color: "Hardal", img: "/images/products/dia/_DSC9935.jpg", slug: "diamond-hardal-plise-perde" },
    ]
  },

  // 2. BAMBU (7 items)
  {
    category: "Bambu",
    seriesTitle: "Bambu Series",
    seriesSlug: "bambu-series-plise-perde",
    basePrice: 66000,
    items: [
      { name: "Bambu Beyaz Plise Perde", color: "Beyaz", img: "/images/products/bambu/bambu beyaz.png", slug: "bambu-beyaz-plise-perde" },
      { name: "Bambu Krem Plise Perde", color: "Krem", img: "/images/products/bambu/bambu krem.png", slug: "bambu-krem-plise-perde" },
      { name: "Bambu Bej Plise Perde", color: "Bej", img: "/images/products/bambu/bambu bej.png", slug: "bambu-bej-plise-perde" },
      { name: "Bambu Ara Gri Plise Perde", color: "Ara Gri", img: "/images/products/bambu/bambu aragri.png", slug: "bambu-ara-gri-plise-perde" },
      { name: "Bambu Gri Plise Perde", color: "Gri", img: "/images/products/bambu/bambu gri.png", slug: "bambu-gri-plise-perde" },
      { name: "Bambu Antrasit Plise Perde", color: "Antrasit", img: "/images/products/bambu/bambu antrasit.png", slug: "bambu-antrasit-plise-perde" },
      { name: "Bambu Kahve Plise Perde", color: "Kahve", img: "/images/products/bambu/bambu kahve.png", slug: "bambu-kahve-plise-perde" },
    ]
  },

  // 3. BLACKOUT (5 items)
  {
    category: "Blackout",
    seriesTitle: "Blackout Series",
    seriesSlug: "blackout-series-plise-perde",
    basePrice: 116600,
    items: [
      { name: "Blackout Krem Plise Perde", color: "Krem", img: "/images/products/blackout/blackout krem.png", slug: "blackout-krem-plise-perde" },
      { name: "Blackout Gri Plise Perde", color: "Gri", img: "/images/products/blackout/blackout gri.png", slug: "blackout-gri-plise-perde" },
      { name: "Blackout Antrasit Plise Perde", color: "Antrasit", img: "/images/products/blackout/blackout antrasit.png", slug: "blackout-antrasit-plise-perde" },
      { name: "Blackout Kahve Plise Perde", color: "Kahve", img: "/images/products/blackout/blackout kahve.png", slug: "blackout-kahve-plise-perde" },
      { name: "Blackout Siyah Plise Perde", color: "Siyah", img: "/images/products/blackout/blackout siyah.png", slug: "blackout-siyah-plise-perde" },
    ]
  },

  // 4. DARK (4 items)
  {
    category: "Dark",
    seriesTitle: "Dark Series",
    seriesSlug: "dark-series-plise-perde",
    basePrice: 82500,
    items: [
      { name: "Dark Krem Plise Perde", color: "Krem", img: "/images/products/dark/dark krem.png", slug: "dark-krem-plise-perde" },
      { name: "Dark Gri Plise Perde", color: "Gri", img: "/images/products/dark/dark gri.png", slug: "dark-gri-plise-perde" },
      { name: "Dark Antrasit Plise Perde", color: "Antrasit", img: "/images/products/dark/dark ant.png", slug: "dark-antrasit-plise-perde" },
      { name: "Dark Kahve Plise Perde", color: "Kahve", img: "/images/products/dark/dark kahve.png", slug: "dark-kahve-plise-perde" },
    ]
  },

  // 5. SILVER (5 items)
  {
    category: "Silver",
    seriesTitle: "Silver Series",
    seriesSlug: "silver-series-plise-perde",
    basePrice: 77000,
    items: [
      { name: "Silver Beyaz Plise Perde", color: "Beyaz", img: "/images/products/silver/silver beyaz.png", slug: "silver-beyaz-plise-perde" },
      { name: "Silver Krem Plise Perde", color: "Krem", img: "/images/products/silver/silver krem.png", slug: "silver-krem-plise-perde" },
      { name: "Silver Gri Plise Perde", color: "Gri", img: "/images/products/silver/silver gri.png", slug: "silver-gri-plise-perde" },
      { name: "Silver Ara Gri Plise Perde", color: "Ara Gri", img: "/images/products/silver/silverara gri.png", slug: "silver-ara-gri-plise-perde" },
      { name: "Silver Antrasit Plise Perde", color: "Antrasit", img: "/images/products/silver/silver antrasit.png", slug: "silver-antrasit-plise-perde" },
    ]
  },

  // 6. TOUCH (4 items)
  {
    category: "Touch",
    seriesTitle: "Touch Series",
    seriesSlug: "touch-series-plise-perde",
    basePrice: 60500,
    items: [
      { name: "Touch 1001 Bej Plise Perde", color: "Bej", img: "/images/products/touch/touch 1001.png", slug: "touch-1001-bej-plise-perde" },
      { name: "Touch 1002 Gri Plise Perde", color: "Gri", img: "/images/products/touch/touch 1002.png", slug: "touch-1002-gri-plise-perde" },
      { name: "Touch 1003 Antrasit Plise Perde", color: "Antrasit", img: "/images/products/touch/touch 1003.png", slug: "touch-1003-antrasit-plise-perde" },
      { name: "Touch 1004 Kahve Plise Perde", color: "Kahve", img: "/images/products/touch/touch 1004.png", slug: "touch-1004-kahve-plise-perde" },
    ]
  },

  // 7. NEW (4 items)
  {
    category: "New",
    seriesTitle: "New Series",
    seriesSlug: "new-series-plise-perde",
    basePrice: 60500,
    items: [
      { name: "New 2001 Bej Plise Perde", color: "Bej", img: "/images/products/new/new 2001.png", slug: "new-2001-bej-plise-perde" },
      { name: "New 2002 Antrasit Plise Perde", color: "Antrasit", img: "/images/products/new/new 2002.png", slug: "new-2002-antrasit-plise-perde" },
      { name: "New 2004 Füme Plise Perde", color: "Füme", img: "/images/products/new/new 2004.png", slug: "new-2004-fume-plise-perde" },
      { name: "New 2005 Bordo Plise Perde", color: "Bordo", img: "/images/products/new/new 2005.png", slug: "new-2005-bordo-plise-perde" },
    ]
  },

  // 8. GOLD (5 items)
  {
    category: "Gold",
    seriesTitle: "Gold Series",
    seriesSlug: "gold-series-plise-perde",
    basePrice: 77000,
    items: [
      { name: "Gold 01 Gri Plise Perde", color: "Gri", img: "/images/products/gold/gold 1.png", slug: "gold-01-gri-plise-perde" },
      { name: "Gold 02 Beyaz Plise Perde", color: "Beyaz", img: "/images/products/gold/gold 2.png", slug: "gold-02-beyaz-plise-perde" },
      { name: "Gold 03 Krem Plise Perde", color: "Krem", img: "/images/products/gold/gold 3.png", slug: "gold-03-krem-plise-perde" },
      { name: "Gold 04 Vizon Plise Perde", color: "Vizon", img: "/images/products/gold/gold 4.png", slug: "gold-04-vizon-plise-perde" },
      { name: "Gold 05 Antrasit Plise Perde", color: "Antrasit", img: "/images/products/gold/gold 5.png", slug: "gold-05-antrasit-plise-perde" },
    ]
  },

  // 9. HONEYCOMB (5 items)
  {
    category: "Honeycomb",
    seriesTitle: "Honeycomb Series",
    seriesSlug: "honeycomb-series-plise-perde",
    basePrice: 116600,
    items: [
      { name: "Honeycomb 001 Beyaz Plise Perde", color: "Beyaz", img: "/images/yaren/HONEY-001.png", slug: "honeycomb-001-beyaz-plise-perde" },
      { name: "Honeycomb 002 Krem Plise Perde", color: "Krem", img: "/images/yaren/HONEY-002.png", slug: "honeycomb-002-krem-plise-perde" },
      { name: "Honeycomb 003 Gri Plise Perde", color: "Gri", img: "/images/yaren/HONEY-003.png", slug: "honeycomb-003-gri-plise-perde" },
      { name: "Honeycomb 004 Antrasit Plise Perde", color: "Antrasit", img: "/images/yaren/HONEY-004.png", slug: "honeycomb-004-antrasit-plise-perde" },
      { name: "Honeycomb 005 Kahve Plise Perde", color: "Kahve", img: "/images/yaren/HONEY-005.png", slug: "honeycomb-005-kahve-plise-perde" },
    ]
  },

  // 10. ARDA (5 items)
  {
    category: "Arda",
    seriesTitle: "Arda Series",
    seriesSlug: "arda-series-plise-perde",
    basePrice: 55000,
    items: [
      { name: "Arda 01 Beyaz Plise Perde", color: "Beyaz", img: "/images/products/arda/arda 1.png", slug: "arda-01-beyaz-plise-perde" },
      { name: "Arda 02 Gri Plise Perde", color: "Gri", img: "/images/products/arda/arda 2.png", slug: "arda-02-gri-plise-perde" },
      { name: "Arda 03 Antrasit Plise Perde", color: "Antrasit", img: "/images/products/arda/arda 3.png", slug: "arda-03-antrasit-plise-perde" },
      { name: "Arda 04 Vizon Plise Perde", color: "Vizon", img: "/images/products/arda/arda 4.png", slug: "arda-04-vizon-plise-perde" },
      { name: "Arda 05 Kahve Plise Perde", color: "Kahve", img: "/images/products/arda/arda 5.png", slug: "arda-05-kahve-plise-perde" },
    ]
  },

  // 11. ASEL (5 items)
  {
    category: "Asel",
    seriesTitle: "Asel Series",
    seriesSlug: "asel-series-plise-perde",
    basePrice: 55000,
    items: [
      { name: "Asel 01 Beyaz Plise Perde", color: "Beyaz", img: "/images/products/asel/asel 01.png", slug: "asel-01-beyaz-plise-perde" },
      { name: "Asel 02 Krem Plise Perde", color: "Krem", img: "/images/products/asel/asel 02.png", slug: "asel-02-krem-plise-perde" },
      { name: "Asel 03 Bej Plise Perde", color: "Bej", img: "/images/products/asel/asel 03.png", slug: "asel-03-bej-plise-perde" },
      { name: "Asel 04 Gri Plise Perde", color: "Gri", img: "/images/products/asel/asel 04 gri.png", slug: "asel-04-gri-plise-perde" },
      { name: "Asel 05 Antrasit Plise Perde", color: "Antrasit", img: "/images/products/asel/asel 05.png", slug: "asel-05-antrasit-plise-perde" },
    ]
  },

  // 12. ECE (3 items)
  {
    category: "Ece",
    seriesTitle: "Ece Series",
    seriesSlug: "ece-series-plise-perde",
    basePrice: 60500,
    items: [
      { name: "Ece 01 Bej Plise Perde", color: "Bej", img: "/images/products/ece/ece 1.png", slug: "ece-01-bej-plise-perde" },
      { name: "Ece 02 Gri Plise Perde", color: "Gri", img: "/images/products/ece/ece 2.png", slug: "ece-02-gri-plise-perde" },
      { name: "Ece 03 Antrasit Plise Perde", color: "Antrasit", img: "/images/products/ece/ece 3.png", slug: "ece-03-antrasit-plise-perde" },
    ]
  },

  // 13. EFE (3 items)
  {
    category: "Efe",
    seriesTitle: "Efe Series",
    seriesSlug: "efe-series-plise-perde",
    basePrice: 60500,
    items: [
      { name: "Efe 01 Bej Plise Perde", color: "Bej", img: "/images/products/efe/efe 01.png", slug: "efe-01-bej-plise-perde" },
      { name: "Efe 02 Gri Plise Perde", color: "Gri", img: "/images/products/efe/efe 02.png", slug: "efe-02-gri-plise-perde" },
      { name: "Efe 03 Antrasit Plise Perde", color: "Antrasit", img: "/images/products/efe/efe 03.png", slug: "efe-03-antrasit-plise-perde" },
    ]
  },

  // 14. REINA (7 items)
  {
    category: "Reina",
    seriesTitle: "Reina Series",
    seriesSlug: "reina-series-plise-perde",
    basePrice: 60500,
    items: [
      { name: "Reina 01 Beyaz Plise Perde", color: "Beyaz", img: "/images/products/reina/reina 01.png", slug: "reina-01-beyaz-plise-perde" },
      { name: "Reina 02 Krem Plise Perde", color: "Krem", img: "/images/products/reina/reina 02.png", slug: "reina-02-krem-plise-perde" },
      { name: "Reina 03 Gri Plise Perde", color: "Gri", img: "/images/products/reina/reina 03.png", slug: "reina-03-gri-plise-perde" },
      { name: "Reina 04 Bej Plise Perde", color: "Bej", img: "/images/products/reina/reina 04.png", slug: "reina-04-bej-plise-perde" },
      { name: "Reina 05 Antrasit Plise Perde", color: "Antrasit", img: "/images/products/reina/reina 05.png", slug: "reina-05-antrasit-plise-perde" },
      { name: "Reina 06 Vizon Plise Perde", color: "Vizon", img: "/images/products/reina/reina 06.png", slug: "reina-06-vizon-plise-perde" },
      { name: "Reina 07 Kahve Plise Perde", color: "Kahve", img: "/images/products/reina/reina 07.png", slug: "reina-07-kahve-plise-perde" },
    ]
  },

  // 15. VENUS (8 items)
  {
    category: "Venus",
    seriesTitle: "Venus Series",
    seriesSlug: "venus-series-plise-perde",
    basePrice: 60500,
    items: [
      { name: "Venus 01 Beyaz Plise Perde", color: "Beyaz", img: "/images/products/venus/1.JPG", slug: "venus-01-beyaz-plise-perde" },
      { name: "Venus 02 Ekru Plise Perde", color: "Ekru", img: "/images/products/venus/2.JPG", slug: "venus-02-ekru-plise-perde" },
      { name: "Venus 03 Açık Gri Plise Perde", color: "Açık Gri", img: "/images/products/venus/3.JPG", slug: "venus-03-acik-gri-plise-perde" },
      { name: "Venus 04 Gri Plise Perde", color: "Gri", img: "/images/products/venus/4.JPG", slug: "venus-04-gri-plise-perde" },
      { name: "Venus 05 Antrasit Plise Perde", color: "Antrasit", img: "/images/products/venus/5.JPG", slug: "venus-05-antrasit-plise-perde" },
      { name: "Venus 06 Bej Plise Perde", color: "Bej", img: "/images/products/venus/6.JPG", slug: "venus-06-bej-plise-perde" },
      { name: "Venus 07 Vizon Plise Perde", color: "Vizon", img: "/images/products/venus/7.JPG", slug: "venus-07-vizon-plise-perde" },
      { name: "Venus 08 Kahve Plise Perde", color: "Kahve", img: "/images/products/venus/8.JPG", slug: "venus-08-kahve-plise-perde" },
    ]
  },

  // 16. TÜLLE (3 items)
  {
    category: "Tülle",
    seriesTitle: "Tülle Series",
    seriesSlug: "tulle-series-plise-perde",
    basePrice: 60500,
    items: [
      { name: "Tülle 01 Beyaz Plise Perde", color: "Beyaz", img: "/images/yaren/TULLE-01_-scaled.jpg", slug: "tulle-01-beyaz-plise-perde" },
      { name: "Tülle 02 Krem Plise Perde", color: "Krem", img: "/images/products/tülle/ChatGPT Image 21 Şub 2026 01_41_23.png", slug: "tulle-02-krem-plise-perde" },
      { name: "Tülle 03 Gri Plise Perde", color: "Gri", img: "/images/products/tülle/ChatGPT Image 21 Şub 2026 01_43_01.png", slug: "tulle-03-gri-plise-perde" },
    ]
  },

  // 17. PARS (2 items)
  {
    category: "Pars",
    seriesTitle: "Pars Series",
    seriesSlug: "pars-series-plise-perde",
    basePrice: 60500,
    items: [
      { name: "Pars 01 Antrasit Plise Perde", color: "Antrasit", img: "/images/products/pars/ChatGPT Image 21 Şub 2026 02_52_28.png", slug: "pars-01-antrasit-plise-perde" },
      { name: "Pars 02 Gri Plise Perde", color: "Gri", img: "/images/products/pars/ChatGPT Image 21 Şub 2026 02_52_28.png", slug: "pars-02-gri-plise-perde" },
    ]
  },
];

async function main() {
  console.log("Seeding all 17 categories and their individual products into PostgreSQL...");

  let totalProducts = 0;
  const generatedSeeds = [];

  for (const group of ALL_CATALOG_DATA) {
    const allColorsInGroup = group.items.map(it => it.color);
    const allImagesInGroup = group.items.map(it => it.img);

    // 1. Ensure the Main Series Product exists
    const mainSlug = group.seriesSlug;
    const existingMain = await sql`SELECT id FROM products WHERE slug = ${mainSlug}`;
    let mainId = existingMain.length > 0 ? existingMain[0].id : crypto.randomUUID();

    const mainSeed = {
      id: mainId,
      name: `${group.seriesTitle} Plise Perde`,
      slug: mainSlug,
      sku: `PLISE-${group.category.toUpperCase()}`,
      description: `Özel ölçüye göre üretilen ${group.seriesTitle} plise perde sistemleri. Yüksek kumaş kalitesi, delmeden pratik montaj.`,
      price: group.basePrice,
      salePrice: group.basePrice,
      currency: "TRY",
      stock: 100,
      availability: "in_stock",
      brand: "Marel",
      category: group.category,
      rootCategory: "Perdeler",
      googleProductCategory: "Home & Garden > Decor > Window Treatments",
      active: 1,
      featured: 1,
      colors: JSON.stringify(allColorsInGroup),
      dimensions: "Özel Ölçüye Göre Üretim",
      installments: 3,
      installmentText: "Peşin Fiyatına 3 Taksit",
      image: group.items[0].img,
      images: allImagesInGroup,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    generatedSeeds.push(mainSeed);

    if (existingMain.length > 0) {
      await sql`
        UPDATE products
        SET name = ${mainSeed.name},
            category = ${group.category},
            root_category = 'Perdeler',
            price = ${mainSeed.price},
            sale_price = ${mainSeed.salePrice},
            colors = ${mainSeed.colors},
            active = 1,
            featured = 1,
            updated_at = NOW()
        WHERE id = ${mainId}
      `;
    } else {
      await sql`
        INSERT INTO products (id, slug, sku, name, category, root_category, description, price, sale_price, currency, stock, availability, brand, google_product_category, active, featured, colors, created_at, updated_at)
        VALUES (${mainId}, ${mainSlug}, ${mainSeed.sku}, ${mainSeed.name}, ${group.category}, 'Perdeler', ${mainSeed.description}, ${mainSeed.price}, ${mainSeed.salePrice}, 'TRY', 100, 'in_stock', 'Marel', ${mainSeed.googleProductCategory}, 1, 1, ${mainSeed.colors}, NOW(), NOW())
      `;
    }

    // Update product_images for main series
    await sql`DELETE FROM product_images WHERE product_id = ${mainId}`;
    for (let i = 0; i < group.items.length; i++) {
      await sql`
        INSERT INTO product_images (id, product_id, source_url, sort_order, created_at)
        VALUES (${crypto.randomUUID()}, ${mainId}, ${group.items[i].img}, ${i}, NOW())
      `;
    }
    totalProducts++;

    // 2. Now insert each INDIVIDUAL color item as a distinct product
    for (let j = 0; j < group.items.length; j++) {
      const item = group.items[j];
      const itemSlug = item.slug;
      const sku = `PLISE-${group.category.toUpperCase()}-${j + 100}`;
      const existingItem = await sql`SELECT id FROM products WHERE slug = ${itemSlug}`;
      let itemId = existingItem.length > 0 ? existingItem[0].id : crypto.randomUUID();

      const itemSeed = {
        id: itemId,
        name: item.name,
        slug: itemSlug,
        sku,
        description: `Özel ölçüye göre üretilen ${item.name}. ${item.color} renk kumaş, kolay montaj seçeneği ve uzun ömürlü mekanizma.`,
        price: group.basePrice,
        salePrice: group.basePrice,
        currency: "TRY",
        stock: 100,
        availability: "in_stock",
        brand: "Marel",
        category: group.category,
        rootCategory: "Perdeler",
        googleProductCategory: "Home & Garden > Decor > Window Treatments",
        active: 1,
        featured: 0,
        colors: JSON.stringify([item.color]),
        dimensions: "Özel Ölçüye Göre Üretim",
        installments: 3,
        installmentText: "Peşin Fiyatına 3 Taksit",
        image: item.img,
        images: [item.img],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      generatedSeeds.push(itemSeed);

      if (existingItem.length > 0) {
        await sql`
          UPDATE products
          SET name = ${itemSeed.name},
              category = ${group.category},
              root_category = 'Perdeler',
              price = ${itemSeed.price},
              sale_price = ${itemSeed.salePrice},
              colors = ${itemSeed.colors},
              active = 1,
              updated_at = NOW()
          WHERE id = ${itemId}
        `;
      } else {
        await sql`
          INSERT INTO products (id, slug, sku, name, category, root_category, description, price, sale_price, currency, stock, availability, brand, google_product_category, active, featured, colors, created_at, updated_at)
          VALUES (${itemId}, ${itemSlug}, ${sku}, ${itemSeed.name}, ${group.category}, 'Perdeler', ${itemSeed.description}, ${itemSeed.price}, ${itemSeed.salePrice}, 'TRY', 100, 'in_stock', 'Marel', ${itemSeed.googleProductCategory}, 1, 0, ${itemSeed.colors}, NOW(), NOW())
        `;
      }

      await sql`DELETE FROM product_images WHERE product_id = ${itemId}`;
      await sql`
        INSERT INTO product_images (id, product_id, source_url, sort_order, created_at)
        VALUES (${crypto.randomUUID()}, ${itemId}, ${item.img}, 0, NOW())
      `;
      totalProducts++;
    }

    console.log(`✓ Category ${group.category}: ${group.items.length} individual items inserted.`);
  }

  // 3. Write generatedSeeds to db/generated-catalog.ts
  const code = `export const GENERATED_SEEDS = ${JSON.stringify(generatedSeeds, null, 2)};\n`;
  fs.writeFileSync("db/generated-catalog.ts", code, "utf8");
  console.log(`\nSuccessfully wrote ${generatedSeeds.length} products to db/generated-catalog.ts`);
  console.log(`Database sync complete: ${totalProducts} products seeded.`);

  await sql.end();
}

main().catch(err => {
  console.error("Error seeding catalog:", err);
  process.exit(1);
});
