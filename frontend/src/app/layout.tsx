import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PlayerProvider } from "@/contexts/PlayerContext";
import AudioPlayer from "@/components/AudioPlayer";

export const metadata: Metadata = {
  title: "EncycloPEATia - The Complete Ray Peat Archive",
  description: "The definitive Ray Peat knowledge archive: 770+ podcast transcripts, newsletters, articles, and AI-powered search.",
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
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased bg-[var(--background)] text-[var(--foreground)]">
        <PlayerProvider>
          {children}
          <AudioPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
