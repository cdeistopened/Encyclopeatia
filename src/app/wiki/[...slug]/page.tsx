"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface WikiArticle {
  slug: string;
  title: string;
  category?: string;
  status?: string;
  mentions?: number;
  aliases?: string[];
  content: string;
  redirect?: string;
}

// Convert wikilinks [[link]] or [[link|display]] to proper links
function processWikilinks(content: string): string {
  // Pattern matches [[link]] or [[link|display text]]
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, link, display) => {
    const linkText = display || link;
    // Convert the link to a slug format
    const slug = link.toLowerCase().replace(/\s+/g, "-");
    return `[${linkText}](/wiki/${slug})`;
  });
}

// Get category info for styling
function getCategoryInfo(category?: string): { label: string; color: string; icon: string } {
  if (!category) return { label: "Article", color: "bg-gray-100", icon: "article" };

  const cat = category.toLowerCase();
  if (cat.includes("hormone")) return { label: "Hormone", color: "bg-pink-100", icon: "science" };
  if (cat.includes("vitamin")) return { label: "Vitamin", color: "bg-orange-100", icon: "medication" };
  if (cat.includes("mineral")) return { label: "Mineral", color: "bg-blue-100", icon: "diamond" };
  if (cat.includes("food") || cat.includes("beverage")) return { label: "Food", color: "bg-green-100", icon: "restaurant" };
  if (cat.includes("condition")) return { label: "Condition", color: "bg-red-100", icon: "healing" };
  if (cat.includes("mechanism")) return { label: "Mechanism", color: "bg-purple-100", icon: "settings" };
  if (cat.includes("concept")) return { label: "Concept", color: "bg-indigo-100", icon: "psychology" };
  if (cat.includes("people") || cat.includes("person")) return { label: "Person", color: "bg-amber-100", icon: "person" };
  if (cat.includes("drug")) return { label: "Drug", color: "bg-cyan-100", icon: "pill" };
  if (cat.includes("fat")) return { label: "Fat", color: "bg-yellow-100", icon: "water_drop" };
  if (cat.includes("amino")) return { label: "Amino Acid", color: "bg-teal-100", icon: "hub" };

  return { label: category.split("/").pop() || "Article", color: "bg-gray-100", icon: "article" };
}

// Custom link component for wiki links
function WikiLink({ href, children }: { href?: string; children?: React.ReactNode }) {
  if (!href) return <>{children}</>;

  // Internal wiki links
  if (href.startsWith("/wiki/")) {
    return (
      <Link
        href={href}
        className="text-primary hover:text-primary-dark underline decoration-primary/30 hover:decoration-primary transition-colors"
      >
        {children}
      </Link>
    );
  }

  // Episode links (format: [[slug|title]])
  if (href.includes("-ask-the-herb-doctor-") || href.includes("-eastwest-healing-") ||
      href.includes("-generative-energy-") || href.includes("-one-radio-network-") ||
      href.includes("-politics-and-science-")) {
    // Extract show and construct episode URL
    const episodeSlug = href.replace("/wiki/", "");
    return (
      <Link
        href={`/episode/${episodeSlug}`}
        className="text-accent hover:text-accent/80 underline decoration-accent/30 hover:decoration-accent transition-colors"
      >
        {children}
      </Link>
    );
  }

  // External links
  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary-dark underline"
      >
        {children}
      </a>
    );
  }

  return <a href={href}>{children}</a>;
}

export default function WikiPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-ink animate-pulse">
            auto_stories
          </span>
          <p className="mt-4 font-mono text-sm text-ink-muted">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-accent">error</span>
          <h2 className="font-serif text-2xl mt-4">Article Not Found</h2>
          <p className="text-ink-muted mt-2">{error || "Unable to load article"}</p>
          <Link href="/wiki" className="btn-primary mt-6 inline-flex">
            Browse Wiki
          </Link>
        </div>
      </div>
    );
  }

  // Handle redirects
  if (article.redirect) {
    const redirectSlug = article.redirect
      .replace(/\[\[|\]\]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-");
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-muted">Redirecting to {article.redirect}...</p>
          <Link href={`/wiki/${redirectSlug}`} className="text-primary hover:underline">
            Click here if not redirected
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(article.category);
  const processedContent = processWikilinks(article.content);

  return (
    <div className="min-h-screen font-body antialiased">
      {/* Header */}
      <header className="w-full border-b-2 border-ink bg-paper sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="material-symbols-outlined text-2xl text-primary group-hover:rotate-12 transition-transform duration-300">
              auto_stories
            </span>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">
              EncycloPEATia
            </h1>
          </Link>
          <nav className="flex gap-6 items-center">
            <Link
              href="/podcasts"
              className="font-mono text-sm font-medium hover:text-primary transition-colors"
            >
              ARCHIVE
            </Link>
            <Link
              href="/wiki"
              className="font-mono text-sm font-medium text-primary"
            >
              WIKI
            </Link>
            <Link
              href="/encyclopedia"
              className="font-mono text-sm font-medium hover:text-primary transition-colors"
            >
              ENCYCLOPEDIA
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-mono text-ink-muted mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/wiki" className="hover:text-primary">Wiki</Link>
          {article.category && (
            <>
              <span>/</span>
              <span className="text-ink-muted">{categoryInfo.label}</span>
            </>
          )}
          <span>/</span>
          <span className="text-ink">{article.title}</span>
        </nav>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${categoryInfo.color}`}>
              <span className="material-symbols-outlined text-sm align-middle mr-1">{categoryInfo.icon}</span>
              {categoryInfo.label}
            </span>
            {article.status === "complete" && (
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-green-100 text-green-800">
                Complete
              </span>
            )}
            {article.status === "scaffold" && (
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-100 text-yellow-800">
                Scaffold
              </span>
            )}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-4">
            {article.title}
          </h1>

          {article.aliases && article.aliases.length > 0 && (
            <p className="text-ink-muted font-mono text-sm">
              Also known as: {article.aliases.join(", ")}
            </p>
          )}

          {article.mentions && (
            <p className="text-ink-muted font-mono text-sm mt-2">
              <span className="material-symbols-outlined text-sm align-middle mr-1">format_quote</span>
              {article.mentions.toLocaleString()} mentions in source material
            </p>
          )}
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-ink prose-p:text-ink/90 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:not-italic prose-strong:text-ink prose-ul:text-ink/90 prose-li:marker:text-primary">
          <ReactMarkdown
            components={{
              a: ({ href, children }) => <WikiLink href={href}>{children}</WikiLink>,
              h2: ({ children }) => (
                <h2 className="mt-10 mb-4 pb-2 border-b border-ink/10">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-8 mb-3">{children}</h3>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 py-2 my-6 bg-primary/5 rounded-r">
                  {children}
                </blockquote>
              ),
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </article>

        {/* Back Navigation */}
        <div className="mt-12 pt-8 border-t border-ink/10 flex justify-between items-center">
          <Link
            href="/wiki"
            className="flex items-center gap-2 font-mono text-sm font-bold hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Browse Wiki
          </Link>
          <Link
            href="/encyclopedia"
            className="flex items-center gap-2 font-mono text-sm font-bold hover:text-primary transition-colors"
          >
            Encyclopedia
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-ink mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="font-mono text-sm text-ink-muted">
            EncycloPEATia Wiki - Community-driven Ray Peat encyclopedia
          </p>
        </div>
      </footer>
    </div>
  );
}
