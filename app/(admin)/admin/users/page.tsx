import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/session";
import { AdminPage } from "@/components/admin/AdminPage";
import { addAppUser, removeAppUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await requireSession("admin");
  const admin = createSupabaseAdminClient();
  const { data: users } = await admin
    .from("app_users")
    .select("email, role, full_name, created_at")
    .order("role")
    .order("email");

  return (
    <AdminPage
      eyebrow="Admin · Users"
      title="사용자 관리"
      description="픽셀랩 HR에 접근 가능한 Google 계정 목록입니다. 면접관은 본인 응답만, 관리자는 모든 데이터를 봅니다."
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
          + 사용자 추가
        </summary>
        <form
          action={addAppUser}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "var(--spacing-s3)",
            marginTop: "var(--spacing-s4)",
            alignItems: "end",
          }}
        >
          <Field label="이메일" required>
            <input type="email" name="email" required style={inputStyle} />
          </Field>
          <Field label="이름">
            <input type="text" name="full_name" style={inputStyle} />
          </Field>
          <Field label="역할" required>
            <select name="role" defaultValue="interviewer" style={inputStyle}>
              <option value="interviewer">면접관</option>
              <option value="admin">관리자</option>
            </select>
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
              <th>이메일</th>
              <th>이름</th>
              <th>역할</th>
              <th>등록일</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => {
              const isSelf =
                u.email.toLowerCase() === session.email.toLowerCase();
              return (
                <tr key={u.email}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                    {u.email}
                    {isSelf && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 10,
                          color: "var(--color-mute)",
                        }}
                      >
                        (본인)
                      </span>
                    )}
                  </td>
                  <td>{u.full_name ?? "—"}</td>
                  <td>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color:
                          u.role === "admin"
                            ? "var(--color-accent)"
                            : "var(--color-ink-4)",
                      }}
                    >
                      {u.role === "admin" ? "관리자" : "면접관"}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {new Date(u.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td>
                    {!isSelf && (
                      <form action={removeAppUser}>
                        <input type="hidden" name="email" value={u.email} />
                        <button
                          type="submit"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            padding: "4px 8px",
                            border: "1px solid var(--color-warn)",
                            color: "var(--color-warn)",
                            background: "var(--color-paper)",
                            cursor: "pointer",
                          }}
                        >
                          제거
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={5} style={{ color: "var(--color-mute)" }}>
                  사용자가 없습니다. ADMIN_EMAIL_ALLOWLIST 환경변수가 설정되었는지
                  확인해 주세요.
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
