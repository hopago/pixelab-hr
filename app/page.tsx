import Link from "next/link";
import {
  PageA4,
  Masthead,
  DisplayBlock,
  BignumStrip,
  Callout,
  Section,
  SectionHead,
  Card,
  Footer,
} from "@/components/dds";

export default function Home() {
  return (
    <PageA4>
      <Masthead
        meta={[
          { key: "DOC", value: "PIXELAB-HR" },
          { key: "VER", value: "0.1" },
          { key: "DATE", value: "2026.05.10" },
        ]}
      />

      <DisplayBlock
        eyebrow="Pixelab HR · Internal Tool"
        title={"픽셀랩 HR\n통합 관리"}
        lede={
          <>
            조직문화 진단, 1on1 면담, 면접 평가, 핵심인재 풀, 리텐션 신호를{" "}
            <strong>한 곳에서</strong> 관리합니다. 양식은 YAML로 정의하고,
            응답 링크를 발급해 받은 답을 시점·버전이 박제된 형태로 보관합니다.
          </>
        }
      />

      <BignumStrip
        cells={[
          { value: "5", label: "Domains" },
          { value: "7", label: "Forms" },
          { value: "1", label: "Source of Truth" },
        ]}
      />

      <Callout label="시작하기">
        아직 인증·DB가 연결되지 않은 초기 빌드입니다. 다음 단계는 Supabase
        연결 → Google OAuth → 양식 YAML 시드 → 응답 플로우입니다.
      </Callout>

      <Section>
        <SectionHead num="01" title="다섯 영역" aside="DOMAINS" />
        <Card icon="01" title="조직문화 진단" description="16문항 양식, 익명 응답, 8양식 클러스터 시각화." />
        <Card icon="02" title="인사 면담 기록" description="30/60/90일 1on1 양식, 인사 에스컬레이션." />
        <Card icon="03" title="면접 평가 & 질문지" description="직무별 질문지, 면접관별 평가지, 라운드별 묶음." />
        <Card icon="04" title="핵심인재 유치" description="후보자 풀, 단계 트래킹, 이력 정리." />
        <Card icon="05" title="리텐션" description="직원 마스터, 1on1 히스토리, 신호 타임라인." />
      </Section>

      <Section>
        <SectionHead num="02" title="다음 단계" aside="ROADMAP" />
        <p style={{ fontSize: "14.5px", lineHeight: 1.7, color: "var(--color-ink-3)" }}>
          DDS 컴포넌트가 정상 렌더링되는지 확인하기 위한 임시 인덱스 페이지입니다.
          이후 인증과 양식 엔진이 붙으면 이 페이지는 관리자 대시보드로 교체됩니다.
        </p>
        <p style={{ marginTop: "16px" }}>
          <Link
            href="/admin"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12.5px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              borderBottom: "1px solid var(--color-ink)",
              paddingBottom: "2px",
              color: "var(--color-ink)",
              textDecoration: "none",
            }}
          >
            → 관리자 대시보드 (예정)
          </Link>
        </p>
      </Section>

      <Footer left="PIXELAB-HR · v0.1" right="INTERNAL" />
    </PageA4>
  );
}
