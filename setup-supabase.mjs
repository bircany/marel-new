/**
 * Supabase PostgreSQL Schema Setup
 * Runs supabase-schema.sql against the remote database
 */
import postgres from "postgres";
import { readFileSync } from "fs";
import dns from "dns";

// Force IPv6 resolution (Supabase only returns AAAA records)
dns.setDefaultResultOrder("verbatim");

// Read DATABASE_URL from .env.local manually
const envContent = readFileSync(".env.local", "utf-8");
const dbMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!dbMatch) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}
const DATABASE_URL = dbMatch[1].trim();

console.log("🔌 Connecting to Supabase PostgreSQL...");
const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  connect_timeout: 15,
});

try {
  // Test connection
  const [{ now }] = await sql`SELECT NOW() AS now`;
  console.log(`✅ Connected! Server time: ${now}`);

  // Read and run schema
  const schema = readFileSync("supabase-schema.sql", "utf-8");
  
  // Strip SQL comments and split by semicolons
  const statements = schema
    .replace(/--.*$/gm, "")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Drop empty tables if they have 0 rows so fresh schema with correct columns is applied
  const existingTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `;
  for (const row of existingTables) {
    const t = row.table_name;
    try {
      const [{ count }] = await sql.unsafe(`SELECT COUNT(*) AS count FROM "${t}"`);
      if (Number(count) === 0) {
        await sql.unsafe(`DROP TABLE IF EXISTS "${t}" CASCADE`);
        console.log(`  🗑️ Dropped empty table "${t}" for clean recreation`);
      } else {
        console.log(`  ⚠️ Preserving non-empty table "${t}" (${count} rows)`);
      }
    } catch (e) {
      console.warn(`  Could not check/drop ${t}:`, e.message);
    }
  }

  console.log(`\n📋 Running ${statements.length} schema statements...\n`);

  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt);
      const tableName = stmt.match(/(?:TABLE|INDEX)\s+(?:IF NOT EXISTS\s+)?(\w+)/i)?.[1] || "statement";
      console.log(`  ✅ ${tableName}`);
    } catch (err) {
      if (err.message?.includes("already exists")) {
        const name = stmt.match(/(?:TABLE|INDEX)\s+(?:IF NOT EXISTS\s+)?(\w+)/i)?.[1] || "?";
        console.log(`  ⏭️  ${name} (already exists)`);
      } else {
        console.error(`  ❌ Error: ${err.message}`);
        console.error(`     Statement: ${stmt.slice(0, 100)}...`);
      }
    }
  }

  // Verify tables
  console.log("\n📊 Verifying tables...");
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  console.log(`\n✅ Found ${tables.length} tables:`);
  for (const t of tables) {
    try {
      const [{ count }] = await sql.unsafe(`SELECT COUNT(*) AS count FROM "${t.table_name}"`);
      console.log(`   📁 ${t.table_name} (${count} rows)`);
    } catch {
      console.log(`   📁 ${t.table_name} (?)`);
    }
  }

  console.log("\n🎉 Schema setup complete!");
} catch (err) {
  console.error("❌ Connection failed:", err.message);
} finally {
  await sql.end();
}
