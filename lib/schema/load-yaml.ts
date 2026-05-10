import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import yaml from "js-yaml";
import { FormSchema } from "./form-schema";

const FORMS_DIR = path.join(process.cwd(), "forms");

/** Load a single YAML file and validate against FormSchema. */
export async function loadFormYaml(absPath: string) {
  const raw = await fs.readFile(absPath, "utf8");
  const parsed = yaml.load(raw) as unknown;
  const validated = FormSchema.parse(parsed);
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { schema: validated, raw, hash };
}

/** List every form YAML under forms/ — one entry per file. */
export async function listFormYamls() {
  const slugs = await fs.readdir(FORMS_DIR, { withFileTypes: true });
  const results: Array<{
    slug: string;
    version: string; // e.g. "v2"
    absPath: string;
  }> = [];
  for (const entry of slugs) {
    if (!entry.isDirectory()) continue;
    const slugDir = path.join(FORMS_DIR, entry.name);
    const files = await fs.readdir(slugDir);
    for (const f of files) {
      if (!f.endsWith(".yaml") && !f.endsWith(".yml")) continue;
      results.push({
        slug: entry.name,
        version: path.basename(f, path.extname(f)),
        absPath: path.join(slugDir, f),
      });
    }
  }
  return results;
}

/** Load the latest version of a form by slug. */
export async function loadLatestFormBySlug(slug: string) {
  const all = await listFormYamls();
  const matches = all
    .filter((f) => f.slug === slug)
    .sort((a, b) => b.version.localeCompare(a.version));
  if (matches.length === 0) {
    throw new Error(`No YAML found for slug "${slug}"`);
  }
  return loadFormYaml(matches[0].absPath);
}

/** Load a specific version. */
export async function loadFormBySlugVersion(slug: string, version: string) {
  const abs = path.join(FORMS_DIR, slug, `${version}.yaml`);
  return loadFormYaml(abs);
}
