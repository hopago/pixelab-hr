/**
 * Apply supabase/migrations/*.sql in order against DATABASE_URL.
 * Idempotent: each migration's filename is recorded in `__migrations` table
 * after success.
 */
import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Did you create .env.local?");
  process.exit(1);
}

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");

async function main() {
  const sql = postgres(url!, { prepare: false });
  await sql`
    create table if not exists __migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `;

  const applied = await sql<{ filename: string }[]>`
    select filename from __migrations
  `;
  const seen = new Set(applied.map((r) => r.filename));

  const files = (await fs.readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (seen.has(file)) {
      console.log(`✓ ${file} (already applied)`);
      continue;
    }
    const body = await fs.readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    console.log(`→ applying ${file} ...`);
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into __migrations (filename) values (${file})`;
    });
    console.log(`✓ ${file} applied`);
  }

  await sql.end({ timeout: 5 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
