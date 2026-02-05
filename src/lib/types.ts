export interface Episode {
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

export interface Show {
  id: string;
  name: string;
  count: number;
}
