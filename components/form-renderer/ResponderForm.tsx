"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormSchema } from "@/lib/schema/form-schema";
import { SchemaRenderer } from "./SchemaRenderer";

type ResponderFormProps = {
  token: string;
  form: FormSchema;
};

export function ResponderForm({ token, form }: ResponderFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      {error && (
        <div
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--color-warn)",
            color: "var(--color-paper)",
            padding: "10px 16px",
            fontSize: "var(--text-small)",
            zIndex: 100,
          }}
        >
          {error}
        </div>
      )}
      <SchemaRenderer
        form={form}
        onSubmit={async (values) => {
          setError(null);
          const res = await fetch(`/api/r/${encodeURIComponent(token)}/submit`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ values }),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.error ?? "제출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
            return;
          }
          router.push(`/r/${encodeURIComponent(token)}/done`);
        }}
      />
    </>
  );
}
