import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const WIKI_DIR = path.join(process.cwd(), "public", "wiki");

// ---- Link integrity ---------------------------------------------------------
// Build a manifest of every real page, then rewrite [[wikilinks]] so a link is
// only emitted when its target resolves to a page that exists. Anything that
// doesn't resolve (Peat source-document titles, episode/email citations) is
// rendered as plain text — guaranteeing no link ever 404s.
async function getLinkManifest(): Promise<Map<string, string>> {
  const files = await getAllWikiFiles(WIKI_DIR);
  // Process non-stub pages first so a real article wins a basename collision
  // against a temporary stub of the same name.
  files.sort((a, b) => (a.startsWith("stubs/") ? 1 : 0) - (b.startsWith("stubs/") ? 1 : 0));
  const m = new Map<string, string>();
  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    const full = slug.toLowerCase();
    const base = path.basename(slug).toLowerCase();
    if (!m.has(full)) m.set(full, slug);
    if (!m.has(base)) m.set(base, slug);
  }
  return m;
}

function resolveWikiLinks(content: string, manifest: Map<string, string>): string {
  // Pass 1: well-formed [[target|display]] -> link if it resolves, else plain text.
  let out = content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target, display) => {
    const text = String(display || target).trim();
    const key = String(target).trim().toLowerCase().replace(/\s+/g, "-");
    const canonical = manifest.get(key) || manifest.get(key.split("/").pop() || key);
    return canonical ? `[${text}](/wiki/${canonical})` : text;
  });
  // Pass 2: any residual [[...]] left by malformed/unbalanced source markup ->
  // collapse to its display text (last pipe segment), then strip orphan brackets.
  // Guarantees no literal [[wikilink]] markup ever reaches the reader.
  out = out.replace(/\[\[([^\]]*?)\]\]/g, (_m, inner) => {
    const parts = String(inner).split("|");
    return parts[parts.length - 1].trim();
  });
  out = out.replace(/\[\[|\]\]/g, "");
  return out;
}

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

// Recursively find all markdown files in wiki directory
async function getAllWikiFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllWikiFiles(fullPath, baseDir)));
    } else if (entry.name.endsWith(".md") && !entry.name.startsWith(".")) {
      // Get relative path from wiki dir
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;

  // Handle index request
  if (!slug || slug.length === 0 || (slug.length === 1 && slug[0] === "index")) {
    try {
      const files = await getAllWikiFiles(WIKI_DIR);
      const articles = await Promise.all(
        files.map(async (filePath) => {
          const fullPath = path.join(WIKI_DIR, filePath);
          const raw = await fs.readFile(fullPath, "utf-8");
          const { data, content: body } = matter(raw);
          const slug = filePath.replace(/\.md$/, "");
          return {
            slug,
            title: data.title || slug.split("/").pop() || slug,
            category: data.category,
            status: data.status,
            mentions: data.mentions,
            tldr: data.tldr,
            confidence: data.confidence,
            explored: data.explored ?? false,
            wordCount: body.trim() ? body.trim().split(/\s+/).length : 0,
          };
        })
      );

      // Include any categorized vault article. (Vault frontmatter uses
      // `category`/`explored`/`confidence`, not `status` — filtering on
      // `status` silently dropped ~12 valid articles. Keep the STYLE-GUIDE /
      // WIKI- coordination-doc exclusions.)
      const filteredArticles = articles.filter(
        a => (a.category || a.status) && !a.slug.includes("STYLE-GUIDE") && !a.slug.includes("WIKI-")
      );

      return NextResponse.json({ articles: filteredArticles });
    } catch (error) {
      console.error("Error listing wiki articles:", error);
      return NextResponse.json({ error: "Failed to list articles" }, { status: 500 });
    }
  }

  // Handle single article request
  const slugPath = slug.join("/");
  const filePath = path.join(WIKI_DIR, `${slugPath}.md`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const manifest = await getLinkManifest();

    const article: WikiArticle = {
      slug: slugPath,
      title: data.title || slugPath.split("/").pop() || slugPath,
      category: data.category,
      status: data.status,
      mentions: data.mentions,
      aliases: data.aliases,
      content: resolveWikiLinks(content, manifest),
      redirect: data.redirect,
      tldr: data.tldr,
      tags: data.tags,
      confidence: data.confidence,
      explored: data.explored,
      sources: data.sources,
    };

    return NextResponse.json(article);
  } catch (error) {
    // Try without the slug path (maybe it's in a subdirectory)
    try {
      const files = await getAllWikiFiles(WIKI_DIR);
      const matchingFile = files.find(f => {
        const baseName = path.basename(f, ".md");
        return baseName === slug[slug.length - 1];
      });

      if (matchingFile) {
        const fullPath = path.join(WIKI_DIR, matchingFile);
        const fileContent = await fs.readFile(fullPath, "utf-8");
        const { data, content } = matter(fileContent);
        const manifest = await getLinkManifest();

        const article: WikiArticle = {
          slug: matchingFile.replace(/\.md$/, ""),
          title: data.title || slugPath,
          category: data.category,
          status: data.status,
          mentions: data.mentions,
          aliases: data.aliases,
          content: resolveWikiLinks(content, manifest),
          redirect: data.redirect,
          tldr: data.tldr,
          tags: data.tags,
          confidence: data.confidence,
          explored: data.explored,
          sources: data.sources,
        };

        return NextResponse.json(article);
      }
    } catch {}

    return NextResponse.json(
      { error: "Article not found" },
      { status: 404 }
    );
  }
}
