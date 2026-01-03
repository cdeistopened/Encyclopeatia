import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface Episode {
  slug: string;
  title: string;
  show: string;
  date: string;
  duration?: string;
  audioUrl: string | null;
  speakers: string[];
  filePath: string; // polished file path (default)
  rawFilePath?: string; // raw file path if available
}

const TRANSCRIPTS_DIR = path.join(__dirname, "../../transcripts");
const OUTPUT_FILE = path.join(__dirname, "../public/episodes.json");
const CONTENT_DIR = path.join(__dirname, "../public/transcripts");

// Get all polished files (primary)
function getPolishedFiles(dir: string): Map<string, string> {
  const files = new Map<string, string>();

  function walk(currentDir: string, parentDirName?: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith("_") && entry.name !== "polished-gemini-2.5") {
          walk(fullPath, entry.name);
        }
      } else if (entry.name.endsWith(".md") && !entry.name.startsWith("_")) {
        // Check if parent directory is "polished"
        if (parentDirName === "polished") {
          const relativePath = path.relative(TRANSCRIPTS_DIR, fullPath).replace(/\\/g, "/");
          const parts = relativePath.split("/");
          if (parts.length >= 3 && parts[1] === "polished") {
            const key = `${parts[0]}/${parts[2]}`;
            files.set(key, fullPath);
          }
        }
      }
    }
  }

  walk(dir);
  return files;
}

// Get all raw files
function getRawFiles(dir: string): Map<string, string> {
  const files = new Map<string, string>();

  function walk(currentDir: string, parentDirName?: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith("_")) {
          walk(fullPath, entry.name);
        }
      } else if (entry.name.endsWith(".md") && !entry.name.startsWith("_")) {
        // Check if parent directory is "raw"
        if (parentDirName === "raw") {
          const relativePath = path.relative(TRANSCRIPTS_DIR, fullPath).replace(/\\/g, "/");
          const parts = relativePath.split("/");
          if (parts.length >= 3 && parts[1] === "raw") {
            const key = `${parts[0]}/${parts[2]}`;
            files.set(key, fullPath);
          }
        }
      }
    }
  }

  walk(dir);
  return files;
}

function slugify(filePath: string): string {
  const relativePath = path.relative(TRANSCRIPTS_DIR, filePath);
  return relativePath
    .replace(/\.md$/, "")
    .replace(/[^a-zA-Z0-9-/]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function parseEpisode(filePath: string, rawFilePath?: string): Episode | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const { data, content: body } = matter(content);

    // Skip files without proper frontmatter
    if (!data.title && !data.show) {
      return null;
    }

    const slug = slugify(filePath);
    const polishedPath = path.relative(TRANSCRIPTS_DIR, filePath);
    const rawPath = rawFilePath ? path.relative(TRANSCRIPTS_DIR, rawFilePath) : undefined;

    return {
      slug,
      title: data.title || path.basename(filePath, ".md"),
      show: data.show || "Unknown",
      date: data.date_published || data.date || "",
      duration: data.duration || undefined,
      audioUrl: data.audio_url || null,
      speakers: data.speakers || [],
      filePath: polishedPath,
      rawFilePath: rawPath,
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

function copyTranscriptContent(filePath: string, outputPath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const { content: body } = matter(content);

  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, body);
}

async function main() {
  console.log("Building episode index...");

  // Check if we need to rebuild (exists and recent enough, skip)
  if (fs.existsSync(OUTPUT_FILE)) {
    const stats = fs.statSync(OUTPUT_FILE);
    const hoursSinceBuild = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
    
    // For development, use existing file if it's less than 24 hours old
    if (process.env.NODE_ENV === 'development' || hoursSinceBuild < 24) {
      console.log("Using existing episodes.json (recent build)");
      const existingEpisodes = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
      console.log(`Existing episodes.json has ${existingEpisodes.length} episodes`);
      return;
    }
  }

  const polishedFiles = getPolishedFiles(TRANSCRIPTS_DIR);
  const rawFiles = getRawFiles(TRANSCRIPTS_DIR);
  
  console.log(`Found ${polishedFiles.size} polished files`);
  console.log(`Found ${rawFiles.size} raw files`);

  const episodes: Episode[] = [];

  // Ensure output directories exist
  fs.mkdirSync(CONTENT_DIR, { recursive: true });

  // Process polished files (primary)
  for (const [key, polishedPath] of polishedFiles) {
    const rawPath = rawFiles.get(key);
    
    const episode = parseEpisode(polishedPath, rawPath);
    if (episode) {
      episodes.push(episode);
      
      // Copy polished content
      const polishedOutputPath = path.join(CONTENT_DIR, episode.filePath);
      copyTranscriptContent(polishedPath, polishedOutputPath);
      
      // Copy raw content if available
      if (rawPath && episode.rawFilePath) {
        const rawOutputPath = path.join(CONTENT_DIR, episode.rawFilePath);
        copyTranscriptContent(rawPath, rawOutputPath);
      }
    }
  }

  // Sort by date, newest first
  episodes.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(episodes, null, 2));
  console.log(`Generated index with ${episodes.length} episodes`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main().catch(console.error);
