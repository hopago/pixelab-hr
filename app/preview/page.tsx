import Link from "next/link";
import { listFormYamls } from "@/lib/schema/load-yaml";
import {
  PageA4,
  Masthead,
  DisplayBlock,
  Section,
  SectionHead,
  Card,
  Footer,
} from "@/components/dds";

export const dynamic = "force-static";

export default async function PreviewIndex() {
  const forms = await listFormYamls();
  const slugs = Array.from(new Set(forms.map((f) => f.slug)));

  return (
    <PageA4>
      <Masthead
        meta={[
          { key: "DOC", value: "PREVIEW" },
          { key: "VER", value: "—" },
          { key: "DATE", value: "2026.05.10" },
        ]}
      />
      <DisplayBlock
        eyebrow="Form Preview"
        title={"YAML로 정의된\n양식 미리보기"}
        lede={
          <>
            forms/ 디렉토리의 YAML 파일을 SchemaRenderer로 렌더링합니다.
            인쇄 미리보기에서 원본 HTML과 비교할 수 있습니다.
          </>
        }
      />

      <Section>
        <SectionHead num="01" title="등록된 양식" aside={`${slugs.length}`} />
        {slugs.map((slug) => {
          const versions = forms
            .filter((f) => f.slug === slug)
            .map((f) => f.version)
            .sort()
            .reverse();
          return (
            <Link
              key={slug}
              href={`/preview/${slug}`}
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Card
                icon={slug.charAt(0).toUpperCase()}
                title={slug}
                description={`Versions: ${versions.join(", ")}`}
              />
            </Link>
          );
        })}
      </Section>

      <Footer left="PIXELAB-HR · PREVIEW" right="INTERNAL" />
    </PageA4>
  );
}
