import Link from "next/link";
import type { ReactNode } from "react";
import { ASK_EMAIL, CIA_SITE_URL, DIET_SITE_URL, PRIMARY_SOURCE_URL } from "@/lib/constants";

type Active = "home" | "wiki" | "sources" | "ask" | "methodology";

/** Locked-design wordmark navbar, shared across wiki pages. */
export function WikiNav({ active, right }: { active?: Active; right?: ReactNode }) {
  return (
    <div className="navbar">
      <div className="nav-left">
        <Link href="/" className="wm wm-md">
          Ray Peat Wiki<span className="dot">.</span>
        </Link>
        <Link href="/" className={`nav-link${active === "home" ? " active" : ""}`}>Home</Link>
        <Link href="/podcasts" className={`nav-link${active === "sources" ? " active" : ""}`}>Sources</Link>
        <Link href="/ask" className={`nav-link${active === "ask" ? " active" : ""}`}>Ask</Link>
        <Link href="/methodology" className={`nav-link${active === "methodology" ? " active" : ""}`}>Method</Link>
        <a href={`${DIET_SITE_URL}/book`} target="_blank" rel="noopener noreferrer" className="nav-link">
          Book ↗
        </a>
      </div>
      <div className="nav-right">{right}</div>
    </div>
  );
}

/** Locked-design footer, shared across wiki pages with explicit non-affiliation disclaimer. */
export function WikiFooter() {
  return (
    <div className="footer">
      <div>
        Not Ray Peat (1936–2022) · Independent compilation edited by Charlie Deist ·{" "}
        <a href={PRIMARY_SOURCE_URL} target="_blank" rel="noopener noreferrer">RayPeat.com</a>{" "}
        &amp; his books are primary sources · Not medical advice ·{" "}
        <a href={`mailto:${ASK_EMAIL}`}>{ASK_EMAIL}</a>
      </div>
      <div>
        <Link href="/">Home</Link>
        <Link href="/podcasts">Sources</Link>
        <Link href="/ask">Ask</Link>
        <Link href="/methodology">Methodology</Link>
        <a href={`${DIET_SITE_URL}/book`} target="_blank" rel="noopener noreferrer">Book</a>
        <a href={`${DIET_SITE_URL}/merch`} target="_blank" rel="noopener noreferrer">Prints</a>
        <a href={CIA_SITE_URL} target="_blank" rel="noopener noreferrer">CIA ↗</a>
      </div>
    </div>
  );
}
