import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminPage, AdminButton } from "@/components/admin/AdminPage";

export const dynamic = "force-dynamic";

export default async function LinksListPage() {
  const admin = createSupabaseAdminClient();
  const { data: links } = await admin
    .from("form_links")
    .select(
      "id, token, target_name, target_role, expires_at, max_uses, use_count, issued_at, version_id",
    )
    .order("issued_at", { ascending: false })
    .limit(200);

  const versionIds = Array.from(new Set((links ?? []).map((l) => l.version_id)));
  const { data: versions } = await admin
    .from("form_versions")
    .select("id, version_number, template_id")
    .in("id", versionIds.length ? versionIds : ["00000000-0000-0000-0000-000000000000"]);

  const templateIds = Array.from(new Set((versions ?? []).map((v) => v.template_id)));
  const { data: templates } = await admin
    .from("form_templates")
    .select("id, slug, name")
    .in("id", templateIds.length ? templateIds : ["00000000-0000-0000-0000-000000000000"]);

  const versionMap = new Map(
    (versions ?? []).map((v) => [
      v.id,
      {
        version_number: v.version_number,
        template: (templates ?? []).find((t) => t.id === v.template_id),
      },
    ]),
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <AdminPage
      eyebrow="Admin · Links"
      title="발급된 링크"
      action={<AdminButton href="/admin/links/new">새 링크 발급</AdminButton>}
      description="최근 200건. 만료된 링크와 사용 완료된 링크도 함께 표시됩니다."
    >
      <div className="bg-paper border border-line">
        <div className="px-table-wrap">
        <table className="px-table">
          <thead>
            <tr>
              <th style={{ width: "16%" }}>발급</th>
              <th>양식</th>
              <th>대상자</th>
              <th>토큰</th>
              <th>사용</th>
              <th>만료</th>
            </tr>
          </thead>
          <tbody>
            {(links ?? []).map((l) => {
              const v = versionMap.get(l.version_id);
              const isExpired =
                l.expires_at && new Date(l.expires_at) < new Date();
              const isExhausted = l.use_count >= l.max_uses;
              const status = isExpired ? "EXPIRED" : isExhausted ? "USED" : "OPEN";
              return (
                <tr key={l.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {new Date(l.issued_at).toLocaleString("ko-KR")}
                  </td>
                  <td>
                    {v?.template ? (
                      <span>
                        {v.template.name}{" "}
                        <span style={{ color: "var(--color-mute)" }}>
                          v{v.version_number}
                        </span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{l.target_name ?? "(없음)"}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {baseUrl ? (
                      <a
                        href={`${baseUrl}/r/${l.token}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {l.token}
                      </a>
                    ) : (
                      l.token
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color:
                          status === "OPEN"
                            ? "var(--color-ok)"
                            : "var(--color-mute)",
                      }}
                    >
                      {status} · {l.use_count}/{l.max_uses}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {l.expires_at
                      ? new Date(l.expires_at).toLocaleDateString("ko-KR")
                      : "—"}
                  </td>
                </tr>
              );
            })}
            {(!links || links.length === 0) && (
              <tr>
                <td colSpan={6} style={{ color: "var(--color-mute)" }}>
                  발급된 링크가 없습니다.{" "}
                  <Link
                    href="/admin/links/new"
                    style={{ color: "var(--color-ink)" }}
                  >
                    첫 링크 발급
                  </Link>
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
