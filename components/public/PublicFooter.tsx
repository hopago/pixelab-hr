import Link from "next/link";
import { Logo } from "@/components/dds";

export function PublicFooter() {
  return (
    <footer className="bg-ink text-paper mt-16 md:mt-24">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-8 md:gap-12 mb-12">
          <div>
            <Logo variant="on-dark" size="md" showSubbrand={true} />
            <p className="mt-4 text-paper/60 text-[13px] leading-[1.7] max-w-[40ch]">
              픽셀랩성형외과의원 인사 관리 사내 도구. 조직문화 진단부터 1on1
              면담, 면접 평가, 핵심인재 풀, 리텐션 신호까지 한 곳에서 관리합니다.
            </p>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-paper/40 mb-3">
              Tools
            </div>
            <ul className="space-y-2">
              <FootLink href="/preview">양식 미리보기</FootLink>
              <FootLink href="/login">관리자 로그인</FootLink>
            </ul>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-paper/40 mb-3">
              Owner
            </div>
            <ul className="space-y-2">
              <li className="text-paper/85 text-[13px]">최호준 · 행정실</li>
              <li>
                <a
                  href="https://github.com/hopago/pixelab-hr"
                  target="_blank"
                  rel="noreferrer"
                  className="text-paper/85 hover:text-paper text-[13px] no-underline transition-colors"
                >
                  GitHub →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-2 font-mono text-[10px] tracking-[0.06em] uppercase text-paper/45">
          <div>PIXELAB · BEAUTY CLINIC HR · INTERNAL</div>
          <div>{new Date().getFullYear()} · 사내 전용 도구</div>
        </div>
      </div>
    </footer>
  );
}

function FootLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-paper/85 hover:text-paper text-[13px] no-underline transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
