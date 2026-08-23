import Link from "next/link";

export const metadata = {
  title: "Contribute — Ray Peat Wiki",
  description:
    "The encyclopedia and transcript archive are open source Markdown on GitHub. Write entries, add connections, fix transcripts, hunt sources.",
};

const LANES = [
  {
    icon: "edit_note",
    title: "Write or improve an entry",
    body: "Missing substance, mechanism, or condition Peat discussed? Found a page light on counter-arguments? Every page is one Markdown file with a frontmatter template — claims cited to something Peat actually said or wrote.",
    n: "01",
  },
  {
    icon: "hub",
    title: "Add connections",
    body: "The wiki is a graph, not a folder. [[Wikilinks]] between pages are the entity graph rendered at /topics. Notice aspirin keeps showing up next to progesterone? Add the link where it's relevant.",
    n: "02",
  },
  {
    icon: "graphic_eq",
    title: "Fix transcripts",
    body: "~250 speaker-labeled interviews. Useful fixes: wrong speaker labels, garbled technical terms (pregnenolone is not 'pregnen alone'), section headers that make episodes navigable.",
    n: "03",
  },
  {
    icon: "travel_explore",
    title: "Hunt sources",
    body: "Found an interview, letter, or email exchange we're missing? Open an issue with the link. Copyrighted originals are indexed but never republished here — pointers are still valuable.",
    n: "04",
  },
];

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="inline-block bg-primary text-ink font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 border-2 border-ink shadow-hard-sm mb-6">
          Open Source
        </div>
        <h1 className="font-serif text-5xl font-bold leading-[0.95] mb-6">
          Help build the<br />
          <span className="text-primary">Ray Peat Wiki</span>
        </h1>
        <p className="font-body text-lg text-ink-muted leading-relaxed max-w-2xl mb-10">
          Everything behind this site — the encyclopedia and the transcript
          archive — is plain Markdown on GitHub. Clone it, read it with your AI
          agent, improve it, send it back. Pull requests are the contribution
          mechanism; no permission needed.
        </p>

        {/* The repo */}
        <div className="bg-ink text-white p-5 font-mono text-sm overflow-x-auto border-2 border-ink shadow-hard mb-12">
          <p className="text-primary mb-1"># clone and use it however you want</p>
          <p>git clone https://github.com/cdeistopened/raypeat-wiki.git</p>
        </div>

        {/* Four lanes */}
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-ink-muted mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined">alt_route</span>
          Four ways to contribute
        </h2>
        <div className="grid gap-4 md:grid-cols-2 mb-12">
          {LANES.map(({ icon, title, body, n }) => (
            <div key={n} className="bg-surface border-2 border-ink p-6 shadow-hard-sm hover:shadow-hard transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="material-symbols-outlined text-3xl text-primary">{icon}</span>
                <span className="font-mono text-xs font-bold text-ink-muted">{n}</span>
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">{title}</h3>
              <p className="text-ink-muted text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* What's in the repo */}
        <div className="border-2 border-ink p-6 md:p-8 mb-12 bg-paper-dim">
          <h2 className="font-serif text-2xl font-bold mb-4">What&apos;s in the repo (and what isn&apos;t)</h2>
          <div className="grid gap-6 md:grid-cols-2 text-sm leading-relaxed">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary mb-2">In</p>
              <ul className="space-y-1 text-ink-muted list-disc list-inside">
                <li>The encyclopedia — 300+ wiki pages</li>
                <li>250+ polished interview transcripts</li>
                <li>Entity graph data (631 nodes, 4,388 edges)</li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink-muted mb-2">Deliberately out</p>
              <ul className="space-y-1 text-ink-muted list-disc list-inside">
                <li>Peat&apos;s newsletters, books, and articles — copyrighted, synthesized not republished</li>
                <li>Email exchanges — we cite and link{" "}
                  <a href="https://raypeatemails.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">raypeatemails.com</a>{" "}
                  instead</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mechanics */}
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-ink-muted mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined">merge</span>
          Mechanics
        </h2>
        <ol className="space-y-3 mb-12 max-w-2xl">
          {[
            "Fork the repo and make a branch (feat/aspirin-drug-interactions)",
            "One page or one fix per pull request — keeps review fast",
            "Frontmatter on every page: title, tldr, category, tags, sources, confidence",
            "Maintainers verify against the source corpus before merging",
          ].map((step, i) => (
            <li key={i} className="flex gap-4 items-start">
              <span className="shrink-0 w-7 h-7 bg-primary border-2 border-ink font-mono text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-ink-muted leading-relaxed pt-1">{step}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-3 border-t-2 border-ink pt-8">
          <a
            href="https://github.com/cdeistopened/raypeat-wiki/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">menu_book</span>
            Full Contributing Guide
          </a>
          <a
            href="https://github.com/cdeistopened/raypeat-wiki/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-2 px-5 font-mono text-xs font-bold uppercase tracking-widest border-2 border-ink bg-surface hover:bg-ink hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-base">bug_report</span>
            Report an Issue
          </a>
          <Link
            href="/wiki"
            className="flex items-center gap-2 py-2 px-5 font-mono text-xs font-bold uppercase tracking-widest border-2 border-ink bg-surface hover:bg-ink hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-base">auto_stories</span>
            Browse the Wiki
          </Link>
        </div>
      </main>
    </div>
  );
}
