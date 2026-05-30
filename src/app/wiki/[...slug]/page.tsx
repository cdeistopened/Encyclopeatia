"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { WikiNav, WikiFooter } from "@/components/WikiChrome";

interface WikiArticle {
  slug: string;
  title: string;
  category?: string;
  status?: string;
  mentions?: number;
  aliases?: string[];
  content: string;
  redirect?: string;
  tldr?: string;
  tags?: string[];
  confidence?: string;
  explored?: boolean;
  sources?: string[];
}

const CATEGORY_CLASS: Record<string, string> = {
  substances: "cat-substances",
  concepts: "cat-concepts",
  conditions: "cat-conditions",
  mechanisms: "cat-mechanisms",
  people: "cat-people",
  protocols: "cat-protocols",
  practices: "cat-practices",
  articles: "cat-articles",
};

function slugifyHeading(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: React.ReactNode } }).props;
    return textOf(props?.children);
  }
  return "";
}

// Convert wikilinks [[link]] or [[link|display]] to markdown links.
function processWikilinks(content: string): string {
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, link, display) => {
    const linkText = display || link;
    const slug = link.toLowerCase().replace(/\s+/g, "-");
    return `[${linkText}](/wiki/${slug})`;
  });
}

function WikiLink({ href, children }: { href?: string; children?: React.ReactNode }) {
  if (!href) return <>{children}</>;
  const isEpisode =
    href.includes("-ask-the-herb-doctor-") || href.includes("-eastwest-healing-") ||
    href.includes("-generative-energy-") || href.includes("-one-radio-network-") ||
    href.includes("-politics-and-science-");
  if (isEpisode) {
    return <Link href={`/episode/${href.replace("/wiki/", "")}`} className="wl wl-navy">{children}</Link>;
  }
  if (href.startsWith("/wiki/")) {
    return <Link href={href} className="wl">{children}</Link>;
  }
  if (href.startsWith("http")) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="wl">{children}</a>;
  }
  return <a href={href} className="wl">{children}</a>;
}

export default function WikiPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugParts } = use(params);
  const slug = slugParts.join("/");

  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/wiki/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Article not found");
        return res.json();
      })
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div style={{ background: "#e8e4d8", minHeight: "100vh" }}>
      <div className="page">
        <WikiNav active="wiki" />
        {children}
        <WikiFooter />
      </div>
    </div>
  );

  if (loading) {
    return <Shell><div className="content"><p className="mono">Loading article…</p></div></Shell>;
  }

  if (error || !article) {
    return (
      <Shell>
        <div className="content" style={{ padding: 48 }}>
          <h1 className="page-title" style={{ fontSize: 36 }}>Article not found</h1>
          <p className="lede">{error || "Unable to load this article."}</p>
          <Link href="/wiki" className="btn yellow">Browse the wiki</Link>
        </div>
      </Shell>
    );
  }

  if (article.redirect) {
    const redirectSlug = article.redirect.replace(/\[\[|\]\]/g, "").toLowerCase().replace(/\s+/g, "-");
    return (
      <Shell>
        <div className="content" style={{ padding: 48 }}>
          <p className="lede">Redirecting to {article.redirect}…</p>
          <Link href={`/wiki/${redirectSlug}`} className="wl">Click here if not redirected</Link>
        </div>
      </Shell>
    );
  }

  const categoryKey = article.slug.includes("/") ? article.slug.split("/")[0] : "";
  const catClass = CATEGORY_CLASS[categoryKey] || "cat-articles";

  // Strip a leading line that just echoes the title (common in vault sources),
  // and a leading "# Title" H1, so the drop cap lands on the real opening line.
  const bodyContent = article.content
    .replace(/^\s*#\s+.+\n+/, "")
    .replace(new RegExp(`^\\s*${article.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n+`, "i"), "");
  const processedContent = processWikilinks(bodyContent);

  // Build TOC from H2 headings.
  const toc = Array.from(article.content.matchAll(/^##\s+(.+)$/gm)).map((m) => ({
    text: m[1].replace(/[*_`]/g, "").trim(),
    id: slugifyHeading(m[1]),
  }));

  return (
    <Shell>
      <div className="article-grid">
        {/* Main column */}
        <div className="article-main">
          <div className="breadcrumb">
            <Link href="/wiki">Wiki</Link>
            {categoryKey && (<><span className="sep">/</span><Link href={`/wiki/category/${categoryKey}`}>{categoryKey}</Link></>)}
            <span className="sep">/</span>
            <span>{article.title}</span>
          </div>

          <div className="article-cat-row">
            <span className={`cat-tag ${catClass}`}>{article.category || categoryKey || "article"}</span>
            {article.confidence && <span className="mono">confidence: {article.confidence}</span>}
            {article.explored
              ? <span className="cat-tag sm" style={{ background: "var(--teal)", color: "var(--paper)" }}>✓ reviewed</span>
              : <span className="mono" style={{ opacity: 0.7 }}>unreviewed</span>}
          </div>

          <h1 className="page-title" style={{ fontSize: 52 }}>{article.title}</h1>
          {article.tldr && <p className="lede">{article.tldr}</p>}
          {article.aliases && article.aliases.length > 0 && (
            <p className="mono" style={{ marginBottom: 18 }}>Also known as: {article.aliases.join(", ")}</p>
          )}

          <div className="article-body prose">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => <WikiLink href={href}>{children}</WikiLink>,
                h2: ({ children }) => {
                  const t = textOf(children);
                  const ca = /counter-argument|data gap/i.test(t);
                  return <h2 id={slugifyHeading(t)} className={ca ? "ca-head" : undefined}>{children}</h2>;
                },
                h3: ({ children }) => <h3 id={slugifyHeading(textOf(children))}>{children}</h3>,
              }}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* Right rail */}
        <aside className="right-rail-article">
          {toc.length > 0 && (
            <div className="neo toc-card">
              <div className="head">On this page</div>
              {toc.map((h) => (
                <a key={h.id} href={`#${h.id}`} className="toc-link">{h.text}</a>
              ))}
            </div>
          )}

          <div className="neo infobox">
            <div className="head">Article</div>
            <div className="ib-row"><span className="k">Category</span><span className="v">{article.category || categoryKey}</span></div>
            {article.confidence && <div className="ib-row"><span className="k">Confidence</span><span className="v">{article.confidence}</span></div>}
            <div className="ib-row"><span className="k">Reviewed</span><span className="v">{article.explored ? "Yes" : "Not yet"}</span></div>
            {typeof article.mentions === "number" && (
              <div className="ib-row"><span className="k">Mentions</span><span className="v">{article.mentions.toLocaleString()}</span></div>
            )}
            {article.sources && article.sources.length > 0 && (
              <div className="ib-row"><span className="k">Sources</span><span className="v">{article.sources.length}</span></div>
            )}
            <div className="ib-row"><span className="k">Slug</span><span className="v" style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{article.slug}</span></div>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="neo">
              <div className="head" style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>Tags</div>
              <div className="row-tight" style={{ flexWrap: "wrap", gap: 6 }}>
                {article.tags.map((t) => (
                  <span key={t} className="cat-tag sm" style={{ background: "var(--paper-2)", color: "var(--ink-2)" }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </Shell>
  );
}
