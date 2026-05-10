import {
  PageA4,
  Masthead,
  DisplayBlock,
  Callout,
  Footer,
} from "@/components/dds";

export default function DonePage() {
  return (
    <PageA4>
      <Masthead
        meta={[
          { key: "DOC", value: "PIXELAB-HR" },
          { key: "VER", value: "—" },
          { key: "DATE", value: "SUBMITTED" },
        ]}
      />
      <DisplayBlock
        eyebrow="Response · Submitted"
        title={"답변이\n잘 도착했습니다."}
        lede={
          <>
            시간을 내어 답해 주셔서 감사합니다. 응답은 인사(최호준)가 모아서
            확인합니다. 이 페이지는 그대로 닫으시면 됩니다.
          </>
        }
      />
      <Callout label="이후 일정">
        조직문화 진단 결과는 5월 말 사내 공지로 함께 공유될 예정입니다. 1on1
        면담 응답은 다음 점검 시점에 함께 다시 다룹니다.
      </Callout>
      <Footer left="PIXELAB-HR · DONE" right="THANK YOU" />
    </PageA4>
  );
}
