import fs from "fs";
import path from "path";

const BASE_DIR = "marel-katalog-fotolar";

// Turkish char slugify
function slugify(text) {
  const trMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  };
  return text
    .replace(/[çÇğĞıIİöÖşŞüÜ]/g, match => trMap[match] || match)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Map each folder to category name & series title & base price
const CATEGORY_MAP = {
  dia: {
    categoryName: "Diamond",
    seriesTitle: "Diamond Series",
    basePrice: 55000,
    prefix: "DİAMOND"
  },
  touch: {
    categoryName: "Touch",
    seriesTitle: "Touch Series",
    basePrice: 60500,
    prefix: "TOUCH"
  },
  new: {
    categoryName: "New",
    seriesTitle: "New Series",
    basePrice: 60500,
    prefix: "NEW"
  },
  tülle: {
    categoryName: "Tülle",
    seriesTitle: "Tülle Series",
    basePrice: 60500,
    prefix: "TÜLLE"
  },
  tülle: {
    categoryName: "Tülle",
    seriesTitle: "Tülle Series",
    basePrice: 60500,
    prefix: "TÜLLE"
  },
  efe: {
    categoryName: "Efe",
    seriesTitle: "Efe Series",
    basePrice: 60500,
    prefix: "EFE"
  },
  ece: {
    categoryName: "Ece",
    seriesTitle: "Ece Series",
    basePrice: 60500,
    prefix: "ECE"
  },
  blackout: {
    categoryName: "Blackout",
    seriesTitle: "Blackout Series",
    basePrice: 116600,
    prefix: "BLACKOUT"
  },
  honeycomb: {
    categoryName: "Honeycomb",
    seriesTitle: "Honeycomb Series",
    basePrice: 116600,
    prefix: "HONEYCOMB"
  },
  dark: {
    categoryName: "Dark",
    seriesTitle: "Dark Series",
    basePrice: 82500,
    prefix: "DARK"
  },
  bambu: {
    categoryName: "Bambu",
    seriesTitle: "Bambu Series",
    basePrice: 66000,
    prefix: "BAMBU"
  },
  silver: {
    categoryName: "Silver",
    seriesTitle: "Silver Series",
    basePrice: 77000,
    prefix: "SILVER"
  },
  gold: {
    categoryName: "Gold",
    seriesTitle: "Gold Series",
    basePrice: 77000,
    prefix: "GOLD"
  },
  arda: {
    categoryName: "Arda",
    seriesTitle: "Arda Series",
    basePrice: 55000,
    prefix: "ARDA"
  },
  asel: {
    categoryName: "Asel",
    seriesTitle: "Asel Series",
    basePrice: 55000,
    prefix: "ASEL"
  },
  pars: {
    categoryName: "Pars",
    seriesTitle: "Pars Series",
    basePrice: 60500,
    prefix: "PARS"
  },
  reina: {
    categoryName: "Reina",
    seriesTitle: "Reina Series",
    basePrice: 60500,
    prefix: "REINA"
  },
  venus: {
    categoryName: "Venus",
    seriesTitle: "Venus Series",
    basePrice: 60500,
    prefix: "VENUS"
  }
};

const dirs = fs.readdirSync(BASE_DIR, { withFileTypes: true }).filter(d => d.isDirectory());

for (const d of dirs) {
  const normKey = d.name.normalize("NFC").toLowerCase();
  const info = CATEGORY_MAP[normKey] || CATEGORY_MAP[d.name] || {
    categoryName: d.name.charAt(0).toUpperCase() + d.name.slice(1),
    seriesTitle: d.name.charAt(0).toUpperCase() + d.name.slice(1) + " Series",
    basePrice: 60500,
    prefix: d.name.toUpperCase()
  };

  const dirPath = path.join(BASE_DIR, d.name);
  const files = fs.readdirSync(dirPath).filter(f => !f.startsWith('.') && !f.endsWith('.rar') && !f.endsWith('.zip'));

  console.log(`\n=== Category: ${info.categoryName} (${info.seriesTitle}) - Folder: ${d.name} (${files.length} items) ===`);
  files.forEach((f, idx) => {
    console.log(`  [${idx + 1}] ${f}`);
  });
}
