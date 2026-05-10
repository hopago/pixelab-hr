import Link from "next/link";
import { Logo } from "@/components/dds";

export default async function AccessDenied({
  searchParams,
}: {
  searchParams: Promise<{ need?: string }>;
}) {
  const sp = await searchParams;
  const needsAdmin = sp.need === "admin";

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="border-b border-line bg-paper">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <Link
            href="/"
            aria-label="픽셀랩 HR 홈"
            className="inline-block no-underline text-ink"
          >
            <Logo variant="on-light" size="sm" showSubbrand={false} />
          </Link>
          <Link
            href="/"
            className="font-mono text-[11px] tracking-[0.06em] uppercase text-ink-4 hover:text-ink no-underline transition-colors"
          >
            ← 홈으로
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12 md:py-20">
        <div className="w-full max-w-[480px]">
          <div className="bg-paper border border-line p-8 md:p-10">
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-warn mb-5 flex items-center gap-3">
              <span className="inline-block w-6 h-px bg-warn" />
              Access Denied
            </div>
            <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-[-0.025em] leading-[1.15] mb-4 break-keep">
              이 화면은
              <br />
              열어드릴 수 없습니다.
            </h1>
            <p className="text-[14px] text-ink-4 leading-[1.7] mb-6 break-keep">
              {needsAdmin ? (
                <>
                  이 페이지는 관리자(인사) 권한이 필요합니다. 면접관 계정으로는
                  면접 관련 화면만 열람할 수 있습니다. 권한 확장이 필요하면
                  인사(최호준)에게 문의해 주세요.
                </>
              ) : (
                <>
                  이 Google 계정은 픽셀랩 HR에 등록되어 있지 않습니다.
                  인사(최호준)에게 계정 등록을 요청해 주세요. 등록 후 다시 로그인
                  하시면 정상 입장이 가능합니다.
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="
                  flex-1 inline-flex items-center justify-center
                  bg-ink text-paper border border-ink
                  font-mono text-[12px] tracking-[0.08em] uppercase
                  px-5 py-3.5 no-underline
                  hover:bg-ink-3 transition-colors
                "
              >
                홈으로
              </Link>
              <Link
                href="/login"
                className="
                  flex-1 inline-flex items-center justify-center
                  bg-paper text-ink border border-ink
                  font-mono text-[12px] tracking-[0.08em] uppercase
                  px-5 py-3.5 no-underline
                  hover:bg-surface transition-colors
                "
              >
                다시 로그인
              </Link>
            </div>
          </div>

          <div className="mt-6 bg-paper border-l-[3px] border-ink px-5 py-4">
            <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-4 mb-1.5">
              다음 행동
            </div>
            <p className="text-[13px] text-ink-3 leading-[1.65]">
              인사 라인에 본인의 Google 이메일 주소를 알려 주세요. 등록이 끝나면
              다시 로그인해 주세요.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-line bg-paper">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4 font-mono text-[10px] tracking-[0.06em] uppercase text-mute flex items-center justify-between">
          <span>PIXELAB · BEAUTY CLINIC HR</span>
          <span>OWNER 최호준</span>
        </div>
      </footer>
    </div>
  );
}
