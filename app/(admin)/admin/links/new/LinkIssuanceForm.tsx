"use client";

import { useMemo, useState, useTransition } from "react";
import { issueLinks, type IssuedLink } from "./actions";

type Option = {
  templateId: string;
  slug: string;
  name: string;
  category: string;
  currentVersionId: string | null;
  versions: Array<{ id: string; version_number: number }>;
};

const CATEGORY_LABEL: Record<string, string> = {
  culture: "조직문화",
  onboarding: "1on1 / 온보딩",
  "interview-q": "면접 질문지",
  "interview-eval": "면접 평가지",
  exit: "퇴직 면담",
};

export function LinkIssuanceForm({ options }: { options: Option[] }) {
  const [templateId, setTemplateId] = useState(options[0]?.templateId ?? "");
  const selected = options.find((o) => o.templateId === templateId);
  const [versionId, setVersionId] = useState(selected?.currentVersionId ?? "");

  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [single, setSingle] = useState({ targetName: "", targetRole: "" });
  const [bulkText, setBulkText] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [expiresAt, setExpiresAt] = useState("");

  const [issued, setIssued] = useState<IssuedLink[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Update version when template changes
  const versionsForSelected = selected?.versions ?? [];
  const effectiveVersionId =
    versionId && versionsForSelected.some((v) => v.id === versionId)
      ? versionId
      : (selected?.currentVersionId ?? versionsForSelected[0]?.id ?? "");

  const targets = useMemo(() => {
    if (mode === "single") {
      return [
        {
          targetName: single.targetName.trim() || undefined,
          targetRole: single.targetRole.trim() || undefined,
        },
      ];
    }
    return bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ targetName: line }));
  }, [mode, single, bulkText]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIssued(null);
    startTransition(async () => {
      const res = await issueLinks({
        versionId: effectiveVersionId,
        targets,
        maxUses,
        expiresAt: expiresAt || null,
      });
      if (!res.ok) setError(res.error);
      else setIssued(res.links);
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "grid", gap: "var(--spacing-s5)", maxWidth: 800 }}
    >
      <Field label="양식 (Template)">
        <select
          value={templateId}
          onChange={(e) => {
            setTemplateId(e.target.value);
            const opt = options.find((o) => o.templateId === e.target.value);
            setVersionId(opt?.currentVersionId ?? opt?.versions[0]?.id ?? "");
          }}
          style={selectStyle}
        >
          {options.length === 0 && <option value="">(양식 없음)</option>}
          {options.map((o) => (
            <option key={o.templateId} value={o.templateId}>
              [{CATEGORY_LABEL[o.category] ?? o.category}] {o.name} · {o.slug}
            </option>
          ))}
        </select>
      </Field>

      <Field label="버전">
        <select
          value={effectiveVersionId}
          onChange={(e) => setVersionId(e.target.value)}
          style={selectStyle}
        >
          {versionsForSelected.length === 0 && <option value="">(버전 없음)</option>}
          {versionsForSelected.map((v) => (
            <option key={v.id} value={v.id}>
              v{v.version_number}
              {selected?.currentVersionId === v.id ? " · current" : ""}
            </option>
          ))}
        </select>
      </Field>

      <Field label="발급 모드">
        <div style={{ display: "flex", gap: "var(--spacing-s4)" }}>
          {(["single", "bulk"] as const).map((m) => (
            <label
              key={m}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="mode"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
              />
              {m === "single" ? "단건" : "일괄"}
            </label>
          ))}
        </div>
      </Field>

      {mode === "single" ? (
        <>
          <Field label="대상자 이름 (선택)">
            <input
              type="text"
              value={single.targetName}
              onChange={(e) =>
                setSingle({ ...single, targetName: e.target.value })
              }
              placeholder="발급용 메모. 익명 양식이면 응답에 저장되지 않습니다."
              style={inputStyle}
            />
          </Field>
          <Field label="대상자 역할 (선택)">
            <input
              type="text"
              value={single.targetRole}
              onChange={(e) =>
                setSingle({ ...single, targetRole: e.target.value })
              }
              placeholder="예) 코디네이터 팀장"
              style={inputStyle}
            />
          </Field>
        </>
      ) : (
        <Field label="대상자 명단 (한 줄에 한 명)">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={8}
            placeholder={"김민지\n이수현\n박지원\n..."}
            style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
          />
          <p
            style={{
              fontSize: "var(--text-meta)",
              color: "var(--color-mute)",
              marginTop: 4,
            }}
          >
            {targets.length}명에게 토큰을 발급합니다.
          </p>
        </Field>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--spacing-s5)",
        }}
      >
        <Field label="만료일 (선택)">
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            style={inputStyle}
          />
        </Field>
        <Field label="최대 사용 횟수">
          <input
            type="number"
            min={1}
            max={100}
            value={maxUses}
            onChange={(e) => setMaxUses(parseInt(e.target.value || "1", 10))}
            style={inputStyle}
          />
        </Field>
      </div>

      <div style={{ marginTop: "var(--spacing-s4)" }}>
        <button type="submit" disabled={pending} style={primaryButton(pending)}>
          {pending ? "발급 중…" : `${targets.length}개 링크 발급`}
        </button>
        {error && (
          <span
            style={{
              color: "var(--color-warn)",
              fontSize: "var(--text-small)",
              marginLeft: "var(--spacing-s4)",
            }}
          >
            {error}
          </span>
        )}
      </div>

      {issued && issued.length > 0 && <IssuedList links={issued} />}
    </form>
  );
}

function IssuedList({ links }: { links: IssuedLink[] }) {
  const csv = useMemo(() => {
    const header = "name,token,url\n";
    const body = links
      .map((l) => `"${l.targetName ?? ""}","${l.token}","${l.url}"`)
      .join("\n");
    return header + body;
  }, [links]);

  return (
    <div
      style={{
        marginTop: "var(--spacing-s5)",
        background: "var(--color-paper)",
        border: "1px solid var(--color-line)",
        padding: "var(--spacing-s5)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-meta)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--color-ink-4)",
          marginBottom: "var(--spacing-s3)",
        }}
      >
        발급 완료 · {links.length}건
      </div>
      <table className="px-table" style={{ marginBottom: "var(--spacing-s4)" }}>
        <thead>
          <tr>
            <th style={{ width: "30%" }}>이름</th>
            <th>URL</th>
            <th style={{ width: 80 }}>복사</th>
          </tr>
        </thead>
        <tbody>
          {links.map((l) => (
            <tr key={l.token}>
              <td>{l.targetName ?? "-"}</td>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                {l.url}
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(l.url)}
                  style={{
                    border: "1px solid var(--color-ink)",
                    background: "var(--color-paper)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  COPY
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <a
        href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
        download="issued-links.csv"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-meta)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-ink)",
          borderBottom: "1px solid var(--color-ink)",
          textDecoration: "none",
          paddingBottom: 2,
        }}
      >
        ↓ CSV 내보내기
      </a>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-meta)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-mute)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--color-line)",
  background: "var(--color-paper)",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-body)",
  color: "var(--color-ink)",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
};

const primaryButton = (disabled: boolean): React.CSSProperties => ({
  background: "var(--color-ink)",
  color: "var(--color-paper)",
  fontFamily: "var(--font-mono)",
  fontSize: "12.5px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  border: "none",
  padding: "14px 24px",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.6 : 1,
});
