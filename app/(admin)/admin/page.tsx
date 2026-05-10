import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";

export const dynamic = "force-dynamic";

async function loadStats() {
  const admin = createSupabaseAdminClient();
  const [{ count: tplCount }, { count: linkCount }, { count: respCount }, openSignals] =
    await Promise.all([
      admin.from("form_templates").select("*", { count: "exact", head: true }),
      admin.from("form_links").select("*", { count: "exact", head: true }),
      admin.from("form_responses").select("*", { count: "exact", head: true }),
      admin
        .from("retention_signals")
        .select("id, severity")
        .is("resolved_at", null),
    ]);
  const openCount = openSignals.data?.length ?? 0;
  const openRed = openSignals.data?.filter((s) => s.severity === "red").length ?? 0;
  return {
    templates: tplCount ?? 0,
    links: linkCount ?? 0,
    responses: respCount ?? 0,
    openSignals: openCount,
    redSignals: openRed,
  };
}

export default async function Dashboard() {
  const stats = await loadStats();

  return (
    <AdminPage
      eyebrow="Admin · Dashboard"
      title="픽셀랩 HR"
      description="조직문화 진단, 1on1 면담, 면접 평가, 후보자 풀, 리텐션 신호를 한 곳에서 관리합니다."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--spacing-s5)",
          marginBottom: "var(--spacing-s7)",
        }}
      >
        <Stat value={stats.templates} label="Form Templates" />
        <Stat value={stats.links} label="Issued Links" />
        <Stat value={stats.responses} label="Responses" />
        <Stat
          value={stats.openSignals}
          label="Open Signals"
          accent={stats.redSignals > 0 ? "warn" : undefined}
          aside={stats.redSignals > 0 ? `${stats.redSignals} red` : undefined}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "var(--spacing-s5)",
        }}
      >
        <QuickAction
          href="/admin/links/new"
          title="새 응답 링크 발급"
          desc="양식과 대상자를 정해 단건 또는 일괄로 응답 링크를 만듭니다."
        />
        <QuickAction
          href="/admin/responses"
          title="모인 응답 보기"
          desc="익명·실명 응답을 양식별로 모아보고, 박제된 양식 그대로 다시 인쇄할 수 있습니다."
        />
        <QuickAction
          href="/admin/culture"
          title="조직문화 8양식 분석"
          desc="16문항 진단 응답을 8양식 클러스터로 평균/편차 시각화합니다."
        />
        <QuickAction
          href="/admin/retention"
          title="리텐션 신호 점검"
          desc="1on1과 면담에서 잡힌 적응·이탈 신호를 점검하고 인사 액션을 정합니다."
        />
      </div>
    </AdminPage>
  );
}

function Stat({
  value,
  label,
  accent,
  aside,
}: {
  value: number;
  label: string;
  accent?: "warn";
  aside?: string;
}) {
  return (
    <div
      style={{
        background: "var(--color-paper)",
        border: "1px solid var(--color-line)",
        padding: "var(--spacing-s5)",
        borderTop:
          accent === "warn"
            ? "3px solid var(--color-warn)"
            : "3px solid var(--color-ink)",
      }}
    >
      <div
        style={{
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          fontFeatureSettings: '"tnum"',
          lineHeight: 1,
          marginBottom: "var(--spacing-s2)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-meta)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-mute)",
        }}
      >
        {label}
      </div>
      {aside && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--color-warn)",
            marginTop: 4,
          }}
        >
          {aside}
        </div>
      )}
    </div>
  );
}

function QuickAction({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        background: "var(--color-paper)",
        border: "1px solid var(--color-line)",
        padding: "var(--spacing-s5)",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: "var(--text-small)", color: "var(--color-ink-4)", lineHeight: 1.6 }}>
        {desc}
      </div>
    </Link>
  );
}
