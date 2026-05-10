/**
 * Reads forms/**\/*.yaml, validates against FormSchema, and upserts each into
 * form_templates / form_versions. New version_number is the YAML's `version`
 * field. Same hash → no-op. Different hash for an existing (template, version) pair → updates the schema_json + hash.
 *
 * After all upserts, sets each template's current_version_id to its highest
 * version row.
 */
import "dotenv/config";
import postgres from "postgres";
import { listFormYamls, loadFormYaml } from "../lib/schema/load-yaml";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Did you create .env.local?");
  process.exit(1);
}

async function main() {
  const sql = postgres(url!, { prepare: false });

  const files = await listFormYamls();
  if (files.length === 0) {
    console.log("No YAML files in forms/");
    return;
  }

  for (const f of files) {
    const { schema, hash } = await loadFormYaml(f.absPath);

    // Upsert form_templates
    const [template] = await sql<{ id: string }[]>`
      insert into form_templates (slug, category, name)
      values (${schema.slug}, ${schema.category}, ${schema.name})
      on conflict (slug) do update set
        category = excluded.category,
        name = excluded.name,
        updated_at = now()
      returning id
    `;

    // Check existing version
    const existing = await sql<{ id: string; source_yaml_hash: string }[]>`
      select id, source_yaml_hash from form_versions
      where template_id = ${template.id} and version_number = ${schema.version}
    `;

    if (existing.length > 0) {
      if (existing[0].source_yaml_hash === hash) {
        console.log(`= ${schema.slug} v${schema.version} (unchanged)`);
        continue;
      }
      await sql`
        update form_versions
        set schema_json = ${JSON.stringify(schema)}::jsonb,
            source_yaml_hash = ${hash}
        where id = ${existing[0].id}
      `;
      console.log(`* ${schema.slug} v${schema.version} (updated)`);
    } else {
      await sql`
        insert into form_versions (template_id, version_number, schema_json, source_yaml_hash)
        values (${template.id}, ${schema.version}, ${JSON.stringify(schema)}::jsonb, ${hash})
      `;
      console.log(`+ ${schema.slug} v${schema.version} (new)`);
    }
  }

  // Set current_version_id = highest version per template.
  await sql`
    update form_templates t
    set current_version_id = v.id
    from (
      select distinct on (template_id) template_id, id
      from form_versions
      order by template_id, version_number desc
    ) v
    where v.template_id = t.id
  `;
  console.log("✓ form_templates.current_version_id refreshed");

  await sql.end({ timeout: 5 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
