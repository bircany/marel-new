import fs from "fs";

const html = fs.readFileSync("yaren_urun_cesitleri.html", "utf8");

// We want to find each heading: DIAMOND SERIES, TOUCH SERIES, etc., and all figure items under it
const seriesList = [
  "DIAMOND SERIES",
  "TOUCH SERIES",
  "NEW SERIES",
  "TULLE SERİES",
  "EFE SERIES",
  "ECE SERIES",
  "BLACKOUT SERIES",
  "HONEYCOMB SERIES",
  "DARK SERIES",
  "BAMBU SERIES",
  "SILVER SERIES",
  "GOLD SERIES"
];

const result = {};

for (let i = 0; i < seriesList.length; i++) {
  const current = seriesList[i];
  const next = seriesList[i + 1] || "Stil Sahibi Mekanlar";
  
  const startIdx = html.indexOf(current);
  const endIdx = html.indexOf(next, startIdx + current.length);
  
  const sectionHtml = html.substring(startIdx, endIdx !== -1 ? endIdx : undefined);
  
  const figRegex = /<figure[^>]*>([\s\S]*?)<\/figure>/gi;
  let match;
  const items = [];
  while ((match = figRegex.exec(sectionHtml)) !== null) {
    const block = match[1];
    const src = block.match(/src=['"]([^'"]+)['"]/i)?.[1];
    const caption = block.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || "";
    if (src) {
      items.push({ src, caption });
    }
  }
  
  result[current] = items;
}

fs.writeFileSync("yaren_series_complete.json", JSON.stringify(result, null, 2));

for (const [k, v] of Object.entries(result)) {
  console.log(k, "-->", v.length, "items");
}
