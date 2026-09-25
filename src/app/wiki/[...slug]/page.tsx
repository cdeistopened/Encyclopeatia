import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { Metadata } from "next";
import WikiArticleClient from "./WikiArticleClient";

const WIKI_DIR = path.join(process.cwd(), "public", "wiki");
const SITE_TITLE = "Ray Peat Wiki";
const FALLBACK_TITLE = "Ray Peat Wiki — An encyclopedia of Ray Peat's bioenergetic framework";

// Recursively find all markdown files in the wiki directory.
// Mirrors src/app/api/wiki/[...slug]/route.ts so slug resolution stays in sync.
async function getAllWikiFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllWikiFiles(fullPath, baseDir)));
    } else if (entry.name.endsWith(".md") && !entry.name.startsWith(".")) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

// Resolve a slug to its article title using the same lookup order as the
// API route: direct path first, then a basename search across all files.
async function resolveArticleTitle(slugParts: string[]): Promise<string | null> {
  const slugPath = slugParts.join("/");
  const filePath = path.join(WIKI_DIR, `${slugPath}.md`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { data } = matter(fileContent);
    return data.title || slugPath.split("/").pop() || slugPath;
  } catch {
    try {
      const files = await getAllWikiFiles(WIKI_DIR);
      const matchingFile = files.find(
        (f) => path.basename(f, ".md") === slugParts[slugParts.length - 1]
      );
      if (matchingFile) {
        const fullPath = path.join(WIKI_DIR, matchingFile);
        const fileContent = await fs.readFile(fullPath, "utf-8");
        const { data } = matter(fileContent);
        return data.title || slugPath;
      }
    } catch {
      // fall through to null below
    }
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return { title: FALLBACK_TITLE };
  }

  const title = await resolveArticleTitle(slug);
  if (!title) {
    return { title: FALLBACK_TITLE };
  }

  return { title: `${title} — ${SITE_TITLE}` };
}

export default async function WikiPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  return <WikiArticleClient params={params} />;
}
