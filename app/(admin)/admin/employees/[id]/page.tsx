import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminPage, AdminButton } from "@/components/admin/AdminPage";

export const dynamic = "force-dynamic";

const SIGNAL_LABEL: Record<string, string> = {
  rights_negotiation: "권리·예외·보상 협상",
  gossip: "정보 통제력 부족",
  accountability: "책임 회피",
  leaving_intent: "퇴사 의사",
  comp_query: "처우·계약 질의",
  conflict: "동료 갈등",
  other: "기타",
};

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: employee } = await admin
    .from("employees")
    .select("id, name, dept, role, email, joined_at, status, notes")
    .eq("id", id)
    .maybeSingle();
  if (!employee) notFound();

  const { data: links } = await admin
    .from("form_links")
    .select("id, token, version_id, issued_at, use_count, max_uses")
    .eq("employee_id", id)
    .order("issued_at", { ascending: false });

  // 1on1 / 면담 응답 history
  const linkIds = (links ?? []).map((l) => l.id);
  const { data: responses } =
    linkIds.length > 0
      ? await admin
          .from("form_responses")
          .select("id, link_id, version_id, submitted_at")
          .in("link_id", linkIds)
          .order("submitted_at", { ascending: false })
      : { data: [] as Array<{ id: string; link_id: string; version_id: string; submitted_at: string }> };

  const versionIds = Array.from(new Set((responses ?? []).map((r) => r.version_id)));
  const { data: versions } =
    versionIds.length > 0
      ? await admin
          .from("form_versions")
          .select("id, version_number, template_id")
          .in("id", versionIds)
      : { data: [] as Array<{ id: string; version_number: number; template_id: string }> };
  const templateIds = Array.from(new Set((versions ?? []).map((v) => v.template_id)));
  const { data: templates } =
    templateIds.length > 0
      ? await admin
          .from("form_templates")
          .select("id, name")
          .in("id", templateIds)
      : { data: [] as Array<{ id: string; name: string }> };
  const versionMap = new Map((versions ?? []).map((v) => [v.id, v]));
  const templateMap = new Map((templates ?? []).map((t) => [t.id, t]));

  const { data: signals } = await admin
    .from("retention_signals")
    .select(
      "id, signal_type, severity, raised_at, resolved_at, raised_by, notes",
    )
    .eq("employee_id", id)
    .order("raised_at", { ascending: false });

  return (
    <AdminPage
      eyebrow="Employee · Detail"
      title={employee.name}
      description={
        <>
          {employee.dept && <span>{employee.dept}</span>}
          {employee.role && <span> · {employee.role}</span>}
          {employee.joined_at && (
            <span>
              {" "}
              · 입사 {new Date(employee.joined_at).toLocaleDateString("ko-KR")}
            </span>
          )}
        </>
      }
      action={
        <AdminButton href={`/admin/links/new?employee=${employee.id}`} variant="ghost">
          1on1 링크 발급
        </AdminButton>
      }
    >
      <Section title="1on1 / 면담 히스토리" count={responses?.length ?? 0}>
        {responses && responses.length > 0 ? (
          <table className="px-table">
            <thead>
              <tr>
                <th>제출 시각</th>
                <th>양식</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r) => {
                const v = versionMap.get(r.version_id);
                const t = v ? templateMap.get(v.template_id) : undefined;
                return (
                  <tr key={r.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      {new Date(r.submitted_at).toLocaleString("ko-KR")}
                    </td>
                    <td>
                      {t?.name ?? "—"}{" "}
                      <span style={{ color: "var(--color-mute)" }}>
                        v{v?.version_number}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/responses/${r.id}`}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--color-ink)",
                        }}
                      >
                        열기 →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <Empty />
        )}
      </Section>

      <Section title="리텐션 신호" count={signals?.length ?? 0}>
        {signals && signals.length > 0 ? (
          <table className="px-table">
            <thead>
              <tr>
                <th>발생</th>
                <th>유형</th>
                <th>심각도</th>
                <th>등록자</th>
                <th>해결</th>
                <th>메모</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {new Date(s.raised_at).toLocaleString("ko-KR")}
                  </td>
                  <td>{SIGNAL_LABEL[s.signal_type] ?? s.signal_type}</td>
                  <td>
                    <SeverityDot severity={s.severity} />
                  </td>
                  <td>{s.raised_by ?? "—"}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {s.resolved_at
                      ? new Date(s.resolved_at).toLocaleDateString("ko-KR")
                      : "OPEN"}
                  </td>
                  <td
                    style={{ fontSize: 12, color: "var(--color-ink-3)" }}
                  >
                    {s.notes ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty />
        )}
      </Section>
    </AdminPage>
  );
}

function SeverityDot({ severity }: { severity: string }) {
  const map: Record<string, { bg: string; label: string }> = {
    red: { bg: "var(--color-warn)", label: "RED" },
    yellow: { bg: "#D97706", label: "YELLOW" },
    green: { bg: "var(--color-ok)", label: "GREEN" },
  };
  const s = map[severity] ?? map.yellow;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.08em",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          background: s.bg,
          display: "inline-block",
        }}
      />
      {s.label}
    </span>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "var(--spacing-s6)" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-meta)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--color-ink-4)",
          marginBottom: "var(--spacing-s3)",
          paddingBottom: "var(--spacing-s2)",
          borderBottom: "1px solid var(--color-ink)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{title}</span>
        <span>{count}</span>
      </div>
      <div
        style={{
          background: "var(--color-paper)",
          border: "1px solid var(--color-line)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div
      style={{
        padding: "var(--spacing-s5)",
        color: "var(--color-mute)",
        fontSize: "var(--text-small)",
      }}
    >
      —
    </div>
  );
}
