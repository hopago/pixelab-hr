import type { ReactNode } from "react";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

type Props = {
  children: ReactNode;
  /** Hide nav links on the right (e.g. login page chrome). */
  minimal?: boolean;
  /** Hide the footer entirely (e.g. inside the responder flow). */
  hideFooter?: boolean;
};

/**
 * Shared chrome for the public-facing site:
 * sticky top header (logo + nav + login CTA) + footer.
 * Use on `/`, `/preview`, `/login`, `/access-denied`.
 */
export function PublicShell({
  children,
  minimal = false,
  hideFooter = false,
}: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <PublicHeader minimal={minimal} />
      <div className="flex-1">{children}</div>
      {!hideFooter && <PublicFooter />}
    </div>
  );
}
