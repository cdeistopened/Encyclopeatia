import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PlayerProvider } from "@/contexts/PlayerContext";
import AudioPlayer from "@/components/AudioPlayer";

export const metadata: Metadata = {
  title: "Ray Peat Wiki — An encyclopedia of Ray Peat's bioenergetic framework",
  description: "An encyclopedia of Ray Peat's bioenergetic framework: 300+ interlinked articles on substances, mechanisms, and protocols, plus a searchable archive of podcast transcripts.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Archivo:wght@400;500;600;700;800;900&family=Noto+Sans:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&family=JetBrains+Mono:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased bg-paper text-ink">
        <PlayerProvider>
          {children}
          <AudioPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
