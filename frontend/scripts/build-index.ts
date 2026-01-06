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
  filePath: string | null;
  rawFilePath: string | null;
}

const TRANSCRIPTS_DIR = path.join(__dirname, "../public/transcripts");
const OUTPUT_FILE = path.join(__dirname, "../public/episodes.json");

interface TranscriptFile {
  show: string;
  filename: string;
  type: "polished" | "raw";
  fullPath: string;
  relativePath: string;
}

function getAllTranscriptFiles(dir: string): TranscriptFile[] {
  const files: TranscriptFile[] = [];

  const shows = fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."));

  for (const show of shows) {
    const showPath = path.join(dir, show.name);
    
    for (const type of ["polished", "raw"] as const) {
      const typePath = path.join(showPath, type);
      if (!fs.existsSync(typePath)) continue;
      
      const mdFiles = fs.readdirSync(typePath)
        .filter(f => f.endsWith(".md") && !f.startsWith("_"));
      
      for (const filename of mdFiles) {
        const fullPath = path.join(typePath, filename);
        const relativePath = `${show.name}/${type}/${filename}`;
        files.push({ show: show.name, filename, type, fullPath, relativePath });
      }
    }
  }

  return files;
}

function parseEpisodeFromFile(file: TranscriptFile): Partial<Episode> | null {
  try {
    const content = fs.readFileSync(file.fullPath, "utf-8");
    const { data } = matter(content);

    if (!data.title && !data.show) return null;

    return {
      title: data.title || path.basename(file.filename, ".md"),
      show: data.show || file.show,
      date: data.date_published || data.date || "",
      duration: data.duration || undefined,
      audioUrl: data.audio_url || null,
      speakers: data.speakers || [],
    };
  } catch (error) {
    return null;
  }
}

function createSlug(show: string, filename: string): string {
  const base = filename.replace(/\.md$/, "");
  return `${show}/${base}`
    .replace(/[^a-zA-Z0-9-/]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

async function main() {
  console.log("Building episode index from public/transcripts...");

  const allFiles = getAllTranscriptFiles(TRANSCRIPTS_DIR);
  console.log(`Found ${allFiles.length} total transcript files`);

  const episodeMap = new Map<string, Episode>();

  for (const file of allFiles) {
    const key = `${file.show}/${file.filename}`;
    
    if (!episodeMap.has(key)) {
      const metadata = parseEpisodeFromFile(file);
      if (!metadata) continue;

      episodeMap.set(key, {
        slug: createSlug(file.show, file.filename),
        title: metadata.title!,
        show: metadata.show!,
        date: metadata.date!,
        duration: metadata.duration,
        audioUrl: metadata.audioUrl!,
        speakers: metadata.speakers!,
        filePath: null,
        rawFilePath: null,
      });
    }

    const episode = episodeMap.get(key)!;
    if (file.type === "polished") {
      episode.filePath = file.relativePath;
    } else {
      episode.rawFilePath = file.relativePath;
    }
  }

  const episodes = Array.from(episodeMap.values())
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(episodes, null, 2));
  
  const polishedCount = episodes.filter(e => e.filePath).length;
  const rawCount = episodes.filter(e => e.rawFilePath).length;
  const bothCount = episodes.filter(e => e.filePath && e.rawFilePath).length;
  
  console.log(`Generated index with ${episodes.length} episodes`);
  console.log(`  - ${polishedCount} have polished transcripts`);
  console.log(`  - ${rawCount} have raw transcripts`);
  console.log(`  - ${bothCount} have both`);
}

main().catch(console.error);
