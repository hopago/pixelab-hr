import Link from "next/link";
import { Logo } from "@/components/dds";

export default function NotFound() {
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
          <div className="bg-paper border border-line p-8 md:p-12">
            <div className="font-mono text-[60px] md:text-[80px] font-extrabold tracking-[-0.04em] leading-none text-ink mb-3 [font-feature-settings:'tnum']">
              404
            </div>
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-mute mb-6">
              Not Found
            </div>
            <h1 className="text-[22px] md:text-[26px] font-bold tracking-[-0.02em] leading-[1.3] mb-3 break-keep">
              찾으시는 화면이 없습니다.
            </h1>
            <p className="text-[14px] text-ink-4 leading-[1.7] mb-8 break-keep">
              주소가 바뀌었거나, 만료된 링크일 수 있습니다. 응답 링크라면
              인사(최호준)에게 새 링크를 요청해 주세요.
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
                href="/preview"
                className="
                  flex-1 inline-flex items-center justify-center
                  bg-paper text-ink border border-ink
                  font-mono text-[12px] tracking-[0.08em] uppercase
                  px-5 py-3.5 no-underline
                  hover:bg-surface transition-colors
                "
              >
                양식 미리보기
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
