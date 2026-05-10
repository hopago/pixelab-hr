import {
  PageA4,
  Masthead,
  DisplayBlock,
  Callout,
  Footer,
} from "@/components/dds";

export default async function AccessDenied({
  searchParams,
}: {
  searchParams: Promise<{ need?: string }>;
}) {
  const sp = await searchParams;
  const needsAdmin = sp.need === "admin";

  return (
    <PageA4>
      <Masthead
        meta={[
          { key: "DOC", value: "PIXELAB-HR" },
          { key: "VER", value: "—" },
          { key: "DATE", value: "ACCESS DENIED" },
        ]}
      />
      <DisplayBlock
        eyebrow="Access · Denied"
        title={"이 화면은\n열어드릴 수 없습니다."}
        lede={
          needsAdmin ? (
            <>
              이 페이지는 관리자(인사) 권한이 필요합니다. 면접관 계정으로는 면접
              관련 화면만 열람할 수 있습니다. 권한 확장이 필요하면 인사(최호준)에게
              문의해 주세요.
            </>
          ) : (
            <>
              이 Google 계정은 픽셀랩 HR에 등록되어 있지 않습니다. 인사(최호준)에게
              계정 등록을 요청해 주세요. 등록 후 다시 로그인하시면 정상 입장이
              가능합니다.
            </>
          )
        }
      />

      <Callout label="다음 행동">
        지금 페이지를 닫고, 인사 라인에 이메일 주소를 알려 주세요. 등록이 끝나면
        다시 로그인해 주세요.
      </Callout>

      <Footer left="PIXELAB-HR · ACCESS DENIED" right="OWNER 최호준" />
    </PageA4>
  );
}
