/**
 * Seeds the first admin row in app_users.
 * Reads ADMIN_EMAIL_ALLOWLIST (comma-separated) from .env.local and upserts
 * each as role='admin'. Idempotent.
 */
import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
const list = (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

if (list.length === 0) {
  console.error("ADMIN_EMAIL_ALLOWLIST is empty in .env.local");
  process.exit(1);
}

async function main() {
  const sql = postgres(url!, { prepare: false });
  for (const email of list) {
    await sql`
      insert into app_users (email, role) values (${email}, 'admin')
      on conflict (email) do update set role = 'admin'
    `;
    console.log(`✓ seeded admin ${email}`);
  }
  await sql.end({ timeout: 5 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
