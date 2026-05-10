import Link from "next/link";
import { notFound } from "next/navigation";
import { loadLatestFormBySlug } from "@/lib/schema/load-yaml";
import { SchemaRenderer } from "@/components/form-renderer/SchemaRenderer";
import { PublicShell } from "@/components/public/PublicShell";

export const dynamic = "force-static";

type Params = { slug: string };

export default async function PreviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  let schema;
  try {
    const loaded = await loadLatestFormBySlug(slug);
    schema = loaded.schema;
  } catch {
    notFound();
  }
  return (
    <PublicShell hideFooter>
      {/* Breadcrumb strip — sits between header and the A4 paper */}
      <div className="bg-paper border-b border-line">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-3 md:py-4 flex items-center gap-3 flex-wrap">
          <Link
            href="/preview"
            className="font-mono text-[11px] tracking-[0.06em] uppercase text-ink-4 hover:text-ink no-underline transition-colors"
          >
            ← 양식 목록
          </Link>
          <span className="text-mute-2">·</span>
          <span className="font-mono text-[11px] tracking-[0.06em] uppercase text-ink">
            {schema.doc_id} · v{schema.version}
          </span>
          <span className="text-mute-2 hidden md:inline">·</span>
          <span className="hidden md:inline text-[12px] text-ink-3 truncate">
            {schema.name}
          </span>
          <div className="ml-auto">
            <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-mute">
              {schema.anonymous ? "ANONYMOUS" : schema.retention ?? "RECORDED"}
            </span>
          </div>
        </div>
      </div>

      <SchemaRenderer
        form={schema}
        onSubmit={(values) => {
          if (typeof window !== "undefined") {
            console.log("[preview submit]", values);
          }
        }}
      />
    </PublicShell>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return { title: `Preview · ${slug}` };
}
