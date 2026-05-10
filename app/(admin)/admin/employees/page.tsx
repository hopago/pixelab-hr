import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";
import { createEmployee } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  active: "재직",
  leaving: "퇴사 진행",
  left: "퇴사",
};

export default async function EmployeesPage() {
  const admin = createSupabaseAdminClient();
  const { data: employees } = await admin
    .from("employees")
    .select("id, name, dept, role, email, joined_at, status")
    .order("status")
    .order("dept")
    .order("name");

  // Count open signals per employee
  const { data: signals } = await admin
    .from("retention_signals")
    .select("employee_id, severity")
    .is("resolved_at", null);
  const signalCount = new Map<string, { red: number; total: number }>();
  for (const s of signals ?? []) {
    const cur = signalCount.get(s.employee_id) ?? { red: 0, total: 0 };
    cur.total += 1;
    if (s.severity === "red") cur.red += 1;
    signalCount.set(s.employee_id, cur);
  }

  return (
    <AdminPage
      eyebrow="Admin · Employees"
      title="직원 마스터"
      description="픽셀랩 직원 명단과 입사일, 활성 리텐션 신호 수를 한 눈에 확인합니다."
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
          }}
        >
          + 직원 추가
        </summary>
        <form
          action={createEmployee}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto",
            gap: "var(--spacing-s3)",
            marginTop: "var(--spacing-s4)",
            alignItems: "end",
          }}
        >
          <Field label="이름" required>
            <input type="text" name="name" required style={inputStyle} />
          </Field>
          <Field label="소속">
            <input type="text" name="dept" style={inputStyle} />
          </Field>
          <Field label="직무">
            <input type="text" name="role" style={inputStyle} />
          </Field>
          <Field label="이메일">
            <input type="email" name="email" style={inputStyle} />
          </Field>
          <Field label="입사일">
            <input type="date" name="joined_at" style={inputStyle} />
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
        style={{
          background: "var(--color-paper)",
          border: "1px solid var(--color-line)",
        }}
      >
        <table className="px-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>소속</th>
              <th>직무</th>
              <th>입사일</th>
              <th>상태</th>
              <th>신호</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(employees ?? []).map((e) => {
              const sig = signalCount.get(e.id);
              return (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td>{e.dept ?? "—"}</td>
                  <td>{e.role ?? "—"}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {e.joined_at ?? "—"}
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color:
                          e.status === "active"
                            ? "var(--color-ok)"
                            : e.status === "leaving"
                              ? "var(--color-warn)"
                              : "var(--color-mute)",
                      }}
                    >
                      {STATUS_LABEL[e.status] ?? e.status}
                    </span>
                  </td>
                  <td>
                    {sig ? (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color:
                            sig.red > 0
                              ? "var(--color-warn)"
                              : "var(--color-ink)",
                        }}
                      >
                        {sig.total}
                        {sig.red > 0 ? ` (${sig.red} red)` : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/admin/employees/${e.id}`}
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
            {(!employees || employees.length === 0) && (
              <tr>
                <td colSpan={7} style={{ color: "var(--color-mute)" }}>
                  아직 등록된 직원이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
