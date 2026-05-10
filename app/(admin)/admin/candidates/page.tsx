import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";
import { createCandidate } from "./actions";

export const dynamic = "force-dynamic";

const STAGES: Array<{ key: string; label: string }> = [
  { key: "sourced", label: "발굴" },
  { key: "screened", label: "스크리닝" },
  { key: "interview", label: "면접" },
  { key: "offer", label: "오퍼" },
  { key: "hired", label: "입사" },
  { key: "rejected", label: "보류" },
];

export default async function CandidatesPage() {
  const admin = createSupabaseAdminClient();
  const { data: candidates } = await admin
    .from("candidates")
    .select("id, name, role, source, stage, created_at")
    .order("created_at", { ascending: false });

  return (
    <AdminPage
      eyebrow="Admin · Candidates"
      title="핵심인재 풀"
      description="후보자를 등록하고 단계를 추적합니다. 면접 평가 링크는 후보자 상세 페이지에서 발급합니다."
    >
      <details
        style={{
          background: "var(--color-paper)",
          border: "1px solid var(--color-line)",
          padding: "var(--spacing-s4) var(--spacing-s5)",
          marginBottom: "var(--spacing-s5)",
        }}
      >
        <summary
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            color: "var(--color-ink)",
          }}
        >
          + 후보자 추가
        </summary>
        <form
          action={createCandidate}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-3 mt-4 items-end"
        >
          <Field label="이름" required>
            <input
              type="text"
              name="name"
              required
              style={inputStyle}
              placeholder="예) 김민지"
            />
          </Field>
          <Field label="직무">
            <input
              type="text"
              name="role"
              style={inputStyle}
              placeholder="예) 코디네이터"
            />
          </Field>
          <Field label="유입 경로">
            <input
              type="text"
              name="source"
              style={inputStyle}
              placeholder="예) 잡플래닛"
            />
          </Field>
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
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            추가
          </button>
        </form>
      </details>

      <div
        className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-3 overflow-x-auto md:grid-flow-row md:auto-cols-auto md:grid-cols-3 lg:grid-cols-6 -mx-5 px-5 md:mx-0 md:px-0 pb-2"
      >
        {STAGES.map((s) => {
          const inStage =
            (candidates ?? []).filter((c) => c.stage === s.key) ?? [];
          return (
            <div
              key={s.key}
              style={{
                background: "var(--color-paper)",
                border: "1px solid var(--color-line)",
                minHeight: 320,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-mute)",
                  padding: "var(--spacing-s3) var(--spacing-s4)",
                  borderBottom: "1px solid var(--color-line)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{s.label}</span>
                <span>{inStage.length}</span>
              </div>
              <div style={{ padding: "var(--spacing-s3)" }}>
                {inStage.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/candidates/${c.id}`}
                    style={{
                      display: "block",
                      padding: "var(--spacing-s3)",
                      marginBottom: "var(--spacing-s2)",
                      border: "1px solid var(--color-line)",
                      textDecoration: "none",
                      color: "inherit",
                      background: "var(--color-surface-2)",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                    {c.role && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--color-mute)",
                          marginTop: 2,
                        }}
                      >
                        {c.role}
                      </div>
                    )}
                    {c.source && (
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--color-mute)",
                          marginTop: 4,
                        }}
                      >
                        {c.source}
                      </div>
                    )}
                  </Link>
                ))}
                {inStage.length === 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-mute-2)",
                      padding: "var(--spacing-s3)",
                    }}
                  >
                    —
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AdminPage>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-mute)",
          marginBottom: 4,
        }}
      >
        {label}
        {required && <span style={{ color: "var(--color-warn)" }}> *</span>}
      </div>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid var(--color-line)",
  background: "var(--color-paper)",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  color: "var(--color-ink)",
};
