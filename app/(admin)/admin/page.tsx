import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";
import { cn } from "@/lib/utils";

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-8 md:mb-12">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
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
      className={cn(
        "bg-paper border border-line p-4 md:p-5",
        "border-t-[3px]",
        accent === "warn" ? "border-t-warn" : "border-t-ink",
      )}
    >
      <div className="text-[32px] md:text-[44px] font-bold tracking-[-0.03em] leading-none mb-2 [font-feature-settings:'tnum']">
        {value}
      </div>
      <div className="font-mono text-[10px] md:text-[11px] tracking-[0.08em] uppercase text-mute">
        {label}
      </div>
      {aside && (
        <div className="font-mono text-[10px] text-warn mt-1">{aside}</div>
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
      className="
        block bg-paper border border-line p-5 md:p-6
        no-underline text-inherit
        transition-all duration-200
        hover:border-ink hover:-translate-y-px
        hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)]
      "
    >
      <div className="text-[15px] md:text-[16px] font-semibold mb-1.5">
        {title}
      </div>
      <div className="text-small text-ink-4 leading-[1.65]">{desc}</div>
    </Link>
  );
}
