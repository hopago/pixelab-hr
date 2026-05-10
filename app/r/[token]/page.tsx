import { notFound } from "next/navigation";
import { resolveTokenForResponse } from "@/lib/response/lookups";
import { ResponderForm } from "@/components/form-renderer/ResponderForm";
import {
  PageA4,
  Masthead,
  DisplayBlock,
  Callout,
  Footer,
} from "@/components/dds";

export const dynamic = "force-dynamic";

type Params = { token: string };

export default async function ResponderPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { token } = await params;
  const resolution = await resolveTokenForResponse(token);

  if (!resolution.ok) {
    if (resolution.reason === "not-found") notFound();
    return <ExpiredOrExhausted reason={resolution.reason} />;
  }

  return <ResponderForm token={token} form={resolution.form} />;
}

function ExpiredOrExhausted({
  reason,
}: {
  reason: "expired" | "exhausted";
}) {
  return (
    <PageA4>
      <Masthead
        meta={[
          { key: "DOC", value: "PIXELAB-HR" },
          { key: "VER", value: "—" },
          { key: "DATE", value: "LINK CLOSED" },
        ]}
      />
      <DisplayBlock
        eyebrow="Response · Link Closed"
        title={"이 링크는\n더 이상 응답을 받지 않습니다."}
        lede={
          reason === "expired" ? (
            <>이 응답 링크는 만료되었습니다. 인사(최호준)에게 새 링크를 요청해 주세요.</>
          ) : (
            <>이 링크는 이미 응답이 제출되었습니다. 새 응답이 필요하시면 인사(최호준)에게 새 링크를 요청해 주세요.</>
          )
        }
      />
      <Callout label="다음 행동">
        인사(최호준)에게 본인 이름과 어떤 양식인지 알려 주시면 새 링크를 다시
        보내드립니다.
      </Callout>
      <Footer left="PIXELAB-HR · LINK CLOSED" right="OWNER 최호준" />
    </PageA4>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { token } = await params;
  return { title: `응답 · ${token.slice(0, 6)}…` };
}
