import Link from "next/link";
import {
  ASK_EMAIL,
  CIA_SITE_URL,
  DIET_SITE_URL,
  GITHUB_CORPUS_URL,
  PRIMARY_SOURCE_URL,
} from "@/lib/constants";

export const metadata = {
  title: "Methodology & Build Your Own Wiki — Ray Peat Wiki",
  description:
    "How 50 years of Ray Peat interviews, newsletters, and emails became EncycloPEATia, a clonable AI coach, 251 recipes, and a 348-page verbatim book.",
};

const STAGES = [
  {
    n: "01",
    icon: "graphic_eq",
    title: "Speaker-Tagged Corpus Ingestion",
    body: "264 radio interviews, 249 newsletters, and 244 archived email topics (812 primary sources) were transcribed, cleaned without smoothing away voice, and chunked into 34,017 line-numbered blocks carrying exact source provenance.",
  },
  {
    n: "02",
    icon: "auto_stories",
    title: "Interlinked Markdown Encyclopedia",
    body: "Each substance, hormone, mechanism, and food received an interlinked wiki page synthesized strictly from cited blocks—paired with 251 kitchen recipes extracted separately so Peat's words stay distinct from community cooks.",
  },
  {
    n: "03",
    icon: "terminal",
    title: "Cloneable AI Research Coach",
    body: "The whole wiki and transcript library lives as plain Markdown on GitHub. Point Claude Code, Codex, Cursor, or Obsidian at the cloned folder to query thirty years of talks with exact file-and-line citations.",
  },
  {
    n: "04",
    icon: "menu_book",
    title: "Verbatim Almanack & Print Book",
    body: "Chapters in The Elusive Quest for the Ray Peat Diet are compiled verbatim as editor Q&A—every quote passing automated citation verification against all 346 backmatter endnotes before typesetting the 348-page interior.",
  },
];

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header */}
      <header className="w-full border-b-2 border-ink bg-paper sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="material-symbols-outlined text-3xl text-primary group-hover:rotate-12 transition-transform duration-300">
              auto_stories
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-ink">
              Ray Peat Wiki
            </span>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link
              href="/podcasts"
              className="font-mono text-sm font-medium hover:underline decoration-2 underline-offset-4"
            >
              SOURCES
            </Link>
            <Link
              href="/methodology"
              className="font-mono text-sm font-bold underline decoration-2 underline-offset-4"
            >
              METHODOLOGY
            </Link>
            <a
              href={`${DIET_SITE_URL}/book`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-medium hover:underline decoration-2 underline-offset-4"
            >
              THE BOOK ↗
            </a>
            <Link href="/ask" className="btn-primary">
              ASK PEAT
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="inline-block bg-primary text-ink font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 border-2 border-ink shadow-hard-sm mb-6">
          Architecture &amp; Provenance
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-[1.02] mb-6">
          How 50 Years of Talks Became a Cited Wiki, AI Coach, and Book
        </h1>
        <p className="font-body text-lg text-ink-muted leading-relaxed max-w-2xl mb-12">
          Nothing here was ghostwritten. Every wiki entry on{" "}
          <strong className="text-ink">raypeat.wiki</strong>, every recipe on{" "}
          <a
            href={DIET_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            raypeatdiet.com
          </a>
          , and every answer in{" "}
          <a
            href={`${DIET_SITE_URL}/book`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            The Elusive Quest for the Ray Peat Diet
          </a>{" "}
          traces line-for-line back to primary texts and audio transcripts.
        </p>

        {/* Four stages */}
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-ink-muted mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined">account_tree</span>
          The Four-Stage Pipeline
        </h2>
        <div className="grid gap-4 md:grid-cols-2 mb-14">
          {STAGES.map(({ n, icon, title, body }) => (
            <div key={n} className="bg-surface border-2 border-ink p-6 shadow-hard-sm">
              <div className="flex items-start justify-between mb-3">
                <span className="material-symbols-outlined text-3xl text-primary">{icon}</span>
                <span className="font-mono text-xs font-bold text-ink-muted">{n}</span>
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">{title}</h3>
              <p className="text-ink-muted text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* DIY Local Coach */}
        <section className="border-2 border-ink bg-surface p-6 md:p-8 shadow-hard mb-14">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Run It Yourself · Open Corpus
          </p>
          <h2 className="font-serif text-3xl font-bold mb-3">
            Run Your Own Bioenergetic AI Coach via Git Clone
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-5 max-w-2xl">
            Because all 300+ encyclopedia articles and transcript markdown files are plain text,
            you do not need a proprietary app to interrogate the archive. Clone the repository and
            point any local coding agent or Obsidian vault directly at the folder—or ask questions
            anytime via <Link href="/ask" className="text-primary underline">/ask</Link> or{" "}
            <a href={`mailto:${ASK_EMAIL}`} className="text-primary underline">{ASK_EMAIL}</a>.
          </p>

          <div className="bg-ink text-white p-5 font-mono text-xs md:text-sm overflow-x-auto border-2 border-ink mb-6 space-y-2">
            <p className="text-primary"># 1. Clone the open Markdown corpus</p>
            <p className="select-all">git clone {GITHUB_CORPUS_URL}.git</p>
            <p className="text-primary pt-2"># 2. Open with Claude Code, Codex, Cursor, or Obsidian</p>
            <p className="select-all">cd raypeat-wiki &amp;&amp; claude</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={GITHUB_CORPUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">code</span>
              Clone Corpus Repo ↗
            </a>
            <Link
              href="/contribute"
              className="flex items-center gap-2 py-2 px-5 font-mono text-xs font-bold uppercase tracking-widest border-2 border-ink bg-paper hover:bg-ink hover:text-white transition-all"
            >
              Contribute &amp; Fix Transcripts
            </Link>
          </div>
        </section>

        {/* Creative Intelligence Agency Services Plug */}
        <section className="bg-ink text-white border-2 border-ink p-8 md:p-10 shadow-hard mb-12">
          <span className="inline-block bg-primary text-ink font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 border-2 border-ink mb-5">
            Creative Intelligence Agency
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4">
            Want Your Podcast or Archive Turned Into a Cited Wiki, AI Coach, and Book?
          </h2>
          <p className="text-white/80 leading-relaxed mb-6 max-w-2xl">
            Charlie Deist built EncycloPEATia, the cloneable markdown coach, and the 348-page
            companion book through{" "}
            <a
              href={CIA_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline font-medium"
            >
              Creative Intelligence Agency
            </a>
            . We build complete knowledge engines and &ldquo;in their own words&rdquo; print
            books for podcasters, clinicians, researchers, and thinkers sitting on decades of
            unindexed audio and writing.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={CIA_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Visit creativeintel.agency
            </a>
            <a
              href="mailto:chdeist@gmail.com?subject=Archive%20to%20Wiki%20%26%20Book%20Inquiry"
              className="flex items-center gap-2 py-2 px-5 font-mono text-xs font-bold uppercase tracking-widest border-2 border-white bg-transparent text-white hover:bg-white hover:text-ink transition-all"
            >
              Email Charlie About a Project ✉
            </a>
          </div>
        </section>

        {/* Non-Affiliation Disclaimer */}
        <section className="border-2 border-ink bg-paper-dim p-6">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink mb-2">
            Independent Compilation · Non-Affiliation Notice
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            This is not Ray Peat. Raymond Peat, PhD (1936–2022) had no involvement with this
            website or companion volume, nor is anything here endorsed by his estate or publishers.{" "}
            <a
              href={PRIMARY_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline font-medium"
            >
              RayPeat.com
            </a>{" "}
            and his books are always the primary sources. Educational only; not medical advice.
          </p>
        </section>
      </main>

      <footer className="border-t-2 border-ink bg-paper-dim py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-ink-muted">
          <p>
            © 2026 Ray Peat Wiki · Edited by Charlie Deist ·{" "}
            <a href={`mailto:${ASK_EMAIL}`} className="underline text-ink">{ASK_EMAIL}</a>
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="hover:underline">Home</Link>
            <a href={`${DIET_SITE_URL}/book`} target="_blank" rel="noopener noreferrer" className="hover:underline">The Book ↗</a>
            <a href={`${DIET_SITE_URL}/merch`} target="_blank" rel="noopener noreferrer" className="hover:underline">Print Shop ↗</a>
            <a href={CIA_SITE_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">CIA ↗</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
