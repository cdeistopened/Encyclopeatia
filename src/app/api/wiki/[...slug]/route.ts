import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const WIKI_DIR = path.join(process.cwd(), "public", "wiki");

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
          const content = await fs.readFile(fullPath, "utf-8");
          const { data } = matter(content);
          const slug = filePath.replace(/\.md$/, "");
          return {
            slug,
            title: data.title || slug.split("/").pop() || slug,
            category: data.category,
            status: data.status,
            mentions: data.mentions,
          };
        })
      );

      // Filter out non-article files (like STYLE-GUIDE.md)
      const filteredArticles = articles.filter(
        a => a.status && !a.slug.includes("STYLE-GUIDE") && !a.slug.includes("WIKI-")
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

    const article: WikiArticle = {
      slug: slugPath,
      title: data.title || slugPath.split("/").pop() || slugPath,
      category: data.category,
      status: data.status,
      mentions: data.mentions,
      aliases: data.aliases,
      content: content,
      redirect: data.redirect,
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

        const article: WikiArticle = {
          slug: matchingFile.replace(/\.md$/, ""),
          title: data.title || slugPath,
          category: data.category,
          status: data.status,
          mentions: data.mentions,
          aliases: data.aliases,
          content: content,
          redirect: data.redirect,
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
