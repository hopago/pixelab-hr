import { notFound } from "next/navigation";
import { loadLatestFormBySlug } from "@/lib/schema/load-yaml";
import { SchemaRenderer } from "@/components/form-renderer/SchemaRenderer";

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
    <SchemaRenderer
      form={schema}
      onSubmit={(values) => {
        // Preview mode — log to console
        if (typeof window !== "undefined") {
          console.log("[preview submit]", values);
        }
      }}
    />
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
