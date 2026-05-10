import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";
import { resolveSignal, reopenSignal } from "./actions";

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

export default async function RetentionPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; severity?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "open"; // 'open' | 'all' | 'resolved'
  const severity = sp.severity; // 'red' | 'yellow' | 'green'

  const admin = createSupabaseAdminClient();
  let q = admin
    .from("retention_signals")
    .select(
      "id, employee_id, signal_type, severity, raised_at, resolved_at, raised_by, notes, source_response_id",
    )
    .order("raised_at", { ascending: false });

  if (status === "open") q = q.is("resolved_at", null);
  else if (status === "resolved") q = q.not("resolved_at", "is", null);
  if (severity) q = q.eq("severity", severity);

  const { data: signals } = await q;

  const employeeIds = Array.from(
    new Set((signals ?? []).map((s) => s.employee_id)),
  );
  const { data: employees } =
    employeeIds.length > 0
      ? await admin
          .from("employees")
          .select("id, name, dept, role")
          .in("id", employeeIds)
      : { data: [] as Array<{ id: string; name: string; dept: string | null; role: string | null }> };
  const empMap = new Map((employees ?? []).map((e) => [e.id, e]));

  return (
    <AdminPage
      eyebrow="Admin · Retention"
      title="리텐션 신호"
      description="1on1과 면담 응답에서 자동 추출된 신호와 인사가 직접 등록한 신호를 함께 봅니다. 해결되면 RESOLVE 버튼으로 닫고, 다시 열어야 하면 REOPEN으로 복구합니다."
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: "var(--spacing-s5)",
          flexWrap: "wrap",
        }}
      >
        <Filters status={status} severity={severity} />
      </div>

      <div className="bg-paper border border-line">
        <div className="px-table-wrap">
        <table className="px-table">
          <thead>
            <tr>
              <th style={{ width: "16%" }}>발생</th>
              <th>직원</th>
              <th>신호 유형</th>
              <th style={{ width: "10%" }}>심각도</th>
              <th>출처</th>
              <th style={{ width: "12%" }}>상태</th>
              <th style={{ width: "12%" }}></th>
            </tr>
          </thead>
          <tbody>
            {(signals ?? []).map((s) => {
              const emp = empMap.get(s.employee_id);
              const isOpen = !s.resolved_at;
              return (
                <tr key={s.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {new Date(s.raised_at).toLocaleString("ko-KR")}
                  </td>
                  <td>
                    {emp ? (
                      <Link
                        href={`/admin/employees/${emp.id}`}
                        style={{
                          color: "var(--color-ink)",
                          textDecoration: "none",
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{emp.name}</span>
                        {emp.dept && (
                          <span style={{ color: "var(--color-mute)" }}>
                            {" "}
                            · {emp.dept}
                          </span>
                        )}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{SIGNAL_LABEL[s.signal_type] ?? s.signal_type}</td>
                  <td>
                    <SeverityDot severity={s.severity} />
                  </td>
                  <td>
                    {s.source_response_id ? (
                      <Link
                        href={`/admin/responses/${s.source_response_id}`}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--color-ink)",
                        }}
                      >
                        응답 →
                      </Link>
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--color-mute)",
                        }}
                      >
                        직접 등록
                      </span>
                    )}
                  </td>
                  <td>
                    {isOpen ? (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--color-warn)",
                        }}
                      >
                        OPEN
                      </span>
                    ) : (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--color-ok)",
                        }}
                      >
                        RESOLVED ·{" "}
                        {new Date(s.resolved_at!).toLocaleDateString("ko-KR")}
                      </span>
                    )}
                  </td>
                  <td>
                    <form action={isOpen ? resolveSignal : reopenSignal}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          padding: "4px 8px",
                          border: "1px solid var(--color-ink)",
                          background: "var(--color-paper)",
                          cursor: "pointer",
                        }}
                      >
                        {isOpen ? "RESOLVE" : "REOPEN"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {(!signals || signals.length === 0) && (
              <tr>
                <td colSpan={7} style={{ color: "var(--color-mute)" }}>
                  조건에 맞는 신호가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </AdminPage>
  );
}

function Filters({
  status,
  severity,
}: {
  status: string;
  severity?: string;
}) {
  const filters = [
    { label: "열린 신호", q: "?status=open" },
    { label: "전체", q: "?status=all" },
    { label: "해결됨", q: "?status=resolved" },
    { label: "│", q: "" },
    { label: "RED", q: "?status=open&severity=red" },
    { label: "YELLOW", q: "?status=open&severity=yellow" },
    { label: "GREEN", q: "?status=open&severity=green" },
  ];
  const activeQ = `?status=${status}${severity ? `&severity=${severity}` : ""}`;
  return (
    <>
      {filters.map((f, i) => {
        if (f.q === "")
          return (
            <span
              key={i}
              style={{ color: "var(--color-mute-2)", padding: "0 4px" }}
            >
              {f.label}
            </span>
          );
        const isActive = activeQ === f.q;
        return (
          <Link
            key={i}
            href={`/admin/retention${f.q}`}
            style={{
              display: "inline-block",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "6px 10px",
              border: "1px solid var(--color-ink)",
              background: isActive ? "var(--color-ink)" : "var(--color-paper)",
              color: isActive ? "var(--color-paper)" : "var(--color-ink)",
              textDecoration: "none",
            }}
          >
            {f.label}
          </Link>
        );
      })}
    </>
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
