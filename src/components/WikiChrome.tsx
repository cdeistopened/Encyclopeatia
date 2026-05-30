import Link from "next/link";
import type { ReactNode } from "react";

type Active = "wiki" | "sources" | "ask" | undefined;

/** Locked-design wordmark navbar, shared across wiki pages. */
export function WikiNav({ active, right }: { active?: Active; right?: ReactNode }) {
  return (
    <div className="navbar">
      <div className="nav-left">
        <Link href="/wiki" className="wm wm-md">
          Ray Peat Wiki<span className="dot">.</span>
        </Link>
        <Link href="/wiki" className={`nav-link${active === "wiki" ? " active" : ""}`}>Wiki</Link>
        <Link href="/podcasts" className={`nav-link${active === "sources" ? " active" : ""}`}>Sources</Link>
        <Link href="/ask" className={`nav-link${active === "ask" ? " active" : ""}`}>Ask</Link>
      </div>
      <div className="nav-right">{right}</div>
    </div>
  );
}

/** Locked-design footer, shared across wiki pages. */
export function WikiFooter() {
  return (
    <div className="footer">
      <div>
        Ray Peat Wiki · An open encyclopedia of the bioenergetic framework ·
        Content CC BY-SA 4.0 · Not medical advice
      </div>
      <div>
        <Link href="/wiki">Wiki</Link>
        <Link href="/podcasts">Sources</Link>
        <Link href="/ask">Ask</Link>
      </div>
    </div>
  );
}
