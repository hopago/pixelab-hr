import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminPage, AdminButton } from "@/components/admin/AdminPage";
import { updateCandidateStage } from "../actions";

export const dynamic = "force-dynamic";

const STAGES = [
  "sourced",
  "screened",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;

const STAGE_LABEL: Record<string, string> = {
  sourced: "발굴",
  screened: "스크리닝",
  interview: "면접",
  offer: "오퍼",
  hired: "입사",
  rejected: "보류",
};

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: candidate } = await admin
    .from("candidates")
    .select("id, name, role, source, stage, notes, contact, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!candidate) notFound();

  const { data: links } = await admin
    .from("form_links")
    .select(
      "id, token, target_role, version_id, issued_at, use_count, max_uses",
    )
    .eq("candidate_id", id)
    .order("issued_at", { ascending: false });

  const { data: evals } = await admin
    .from("candidate_evaluations")
    .select(
      "id, response_id, interviewer_email, round, recommendation, created_at",
    )
    .eq("candidate_id", id)
    .order("round")
    .order("created_at");

  return (
    <AdminPage
      eyebrow={`Candidate · ${STAGE_LABEL[candidate.stage] ?? candidate.stage}`}
      title={candidate.name}
      description={
        <>
          {candidate.role && <span>{candidate.role} · </span>}
          {candidate.source && <span>{candidate.source}</span>}
        </>
      }
      action={
        <AdminButton href={`/admin/links/new?candidate=${candidate.id}`} variant="ghost">
          평가 링크 발급
        </AdminButton>
      }
    >
      <form
        action={updateCandidateStage}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-s3)",
          marginBottom: "var(--spacing-s5)",
          background: "var(--color-paper)",
          border: "1px solid var(--color-line)",
          padding: "var(--spacing-s4)",
        }}
      >
        <input type="hidden" name="id" value={candidate.id} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-mute)",
          }}
        >
          단계 변경
        </span>
        <select
          name="stage"
          defaultValue={candidate.stage}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--color-line)",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
          }}
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            background: "var(--color-ink)",
            color: "var(--color-paper)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: "none",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          저장
        </button>
      </form>

      <Section title="발급된 평가 링크" count={links?.length ?? 0}>
        {links && links.length > 0 ? (
          <table className="px-table">
            <thead>
              <tr>
                <th>발급</th>
                <th>역할 메모</th>
                <th>토큰</th>
                <th>사용</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {new Date(l.issued_at).toLocaleString("ko-KR")}
                  </td>
                  <td>{l.target_role ?? "—"}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {l.token}
                  </td>
                  <td>
                    {l.use_count}/{l.max_uses}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty />
        )}
      </Section>

      <Section title="면접 평가" count={evals?.length ?? 0}>
        {evals && evals.length > 0 ? (
          <table className="px-table">
            <thead>
              <tr>
                <th>라운드</th>
                <th>면접관</th>
                <th>추천도</th>
                <th>응답</th>
              </tr>
            </thead>
            <tbody>
              {evals.map((e) => (
                <tr key={e.id}>
                  <td>{e.round}</td>
                  <td>{e.interviewer_email ?? "—"}</td>
                  <td>{e.recommendation ?? "—"}</td>
                  <td>
                    <Link
                      href={`/admin/responses/${e.response_id}`}
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
      <div className="bg-paper border border-line">
        <div className="px-table-wrap">{children}</div>
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
