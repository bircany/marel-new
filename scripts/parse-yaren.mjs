import fs from "fs";

async function parse() {
  const res = await fetch("https://www.yarenpliseperde.com/urun-cesitleri/");
  const html = await res.text();
  fs.writeFileSync("yaren_urun_cesitleri.html", html);
  console.log("HTML length:", html.length);
  
  // Find all headings and images
  const matches = [...html.matchAll(/(<h[234][^>]*>.*?<\/h[234]>|<img[^>]+>)/gis)];
  console.log("Found tags count:", matches.length);
  const items = [];
  for (const m of matches) {
    const tag = m[0];
    if (tag.startsWith("<h")) {
      items.push({ type: "heading", text: tag.replace(/<[^>]+>/g, "").trim() });
    } else {
      const src = tag.match(/src="([^"]+)"/i)?.[1];
      const alt = tag.match(/alt="([^"]*)"/i)?.[1] || "";
      if (src && !src.includes("logo") && !src.includes("icon")) {
        items.push({ type: "img", src, alt });
      }
    }
  }
  fs.writeFileSync("yaren_parsed.json", JSON.stringify(items, null, 2));
  console.log("Saved parsed items:", items.length);
}
parse().catch(console.error);
