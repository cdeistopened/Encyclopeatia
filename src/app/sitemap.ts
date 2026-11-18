import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { MetadataRoute } from "next";

const WIKI_DIR = path.join(process.cwd(), "public", "wiki");
const SITE_URL = "https://raypeat.wiki";

// Recursively find all markdown files in the wiki directory.
// Mirrors src/app/api/wiki/[...slug]/route.ts so the sitemap matches what
// actually resolves as an article.
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const files = await getAllWikiFiles(WIKI_DIR);

  const entries = await Promise.all(
    files.map(async (filePath) => {
      const fullPath = path.join(WIKI_DIR, filePath);
      const [raw, stat] = await Promise.all([
        fs.readFile(fullPath, "utf-8"),
        fs.stat(fullPath),
      ]);
      const { data } = matter(raw);
      const slug = filePath.replace(/\.md$/, "");

      // Same "is this a real article" filter as the API route's index
      // listing: needs a category or status, and isn't a coordination doc.
      // (Drops public/wiki/index.md, which the API route handles as a
      // special case rather than a real article page.)
      const isArticle =
        (data.category || data.status) &&
        !slug.includes("STYLE-GUIDE") &&
        !slug.includes("WIKI-");
      if (!isArticle) return null;

      const dateField = data.updated || data.created;
      const parsedDate = dateField ? new Date(dateField) : null;
      const lastModified =
        parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : stat.mtime;

      return {
        url: `${SITE_URL}/wiki/${slug}`,
        lastModified,
      };
    })
  );

  const articles = entries.filter(
    (e): e is { url: string; lastModified: Date } => e !== null
  );

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/podcasts`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/ask`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/methodology`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/contribute`,
      lastModified: new Date(),
    },
    ...articles,
  ];
}
