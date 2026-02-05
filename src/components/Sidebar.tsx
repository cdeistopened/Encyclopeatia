"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const NAVIGATION = [
  { name: "Episodes", href: "/", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { name: "Ask Peat", href: "/ask", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { name: "Topics", href: "/topics", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
];

const SHOWS = [
  "Ask the Herb Doctor",
  "Politics and Science",
  "Generative Energy",
  "EastWest Healing",
  "One Radio Network",
  "Butter Living Podcast",
  "Jodellefit",
  "It's Rainmaking Time",
  "ELUV",
  "Source Nutritional Show",
  "Voice of America",
  "World Puja",
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedShow = searchParams.get("show");

  return (
    <aside className="w-64 border-r border-ink bg-paper h-screen overflow-y-auto flex-shrink-0 sticky top-0 hidden md:block">
      <div className="p-4">
        <Link href="/" className="block mb-8">
          <h1 className="text-xl font-bold tracking-tight">Ray Peat Radio</h1>
        </Link>

        {/* Main Navigation */}
        <nav className="space-y-1 mb-8">
          {NAVIGATION.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href && !selectedShow
                  ? "bg-surface text-ink shadow-sm border border-ink"
                  : "text-ink-muted hover:bg-surface hover:text-ink"
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={item.icon}
                />
              </svg>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Shows Section */}
        <div className="mb-2 px-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Shows
        </div>
        <nav className="space-y-0.5">
          {SHOWS.map((show) => (
            <Link
              key={show}
              href={`/?show=${encodeURIComponent(show)}`}
              className={`block px-3 py-1.5 text-sm rounded-md transition-colors truncate ${
                selectedShow === show
                  ? "bg-surface text-ink font-medium"
                  : "text-ink-muted hover:text-ink hover:bg-surface"
              }`}
            >
              {show}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}




