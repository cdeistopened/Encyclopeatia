"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { DIET_SITE_URL } from "@/lib/constants";

/**
 * Book launch popup — shows First Edition cover, accurate 348pp specs,
 * instant Chapter 4 ("Coffee") PDF unlock, and link to the full book + print shop.
 */

const SEEN_KEY = "rpw-book-popup-dismissed";

export default function BookPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionStorage.getItem(SEEN_KEY)) {
      const t = setTimeout(() => setOpen(true), 6000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(SEEN_KEY, "1");
    setOpen(false);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/book/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "popup-launch" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Something went wrong");
      setMessage(d.message);
      setState("done");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="The Elusive Quest for the Ray Peat Diet — First Edition"
      className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-md bg-surface border-2 border-ink shadow-hard"
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-paper border-2 border-ink font-mono text-xs font-bold hover:bg-ink hover:text-white transition-colors flex items-center justify-center"
      >
        ✕
      </button>

      <div className="flex gap-0">
        <div className="relative w-32 shrink-0 border-r-2 border-ink bg-ink">
          <Image
            src="/book/cover-front.jpg"
            alt="Cover of The Elusive Quest for the Ray Peat Diet"
            width={960}
            height={1440}
            className="object-cover h-full w-full"
          />
        </div>

        <div className="p-5 flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
            First Edition · 348 Pages
          </p>
          <h3 className="font-serif text-lg font-bold leading-snug mb-1">
            The Elusive Quest for the Ray Peat Diet
          </h3>
          <p className="font-mono text-[10px] text-ink-muted mb-2.5">
            In His Own Words · 346 notes · Paperback $24.95 / Hardcover $34.95
          </p>

          {state !== "done" ? (
            <>
              <p className="text-xs text-ink-muted leading-relaxed mb-3">
                Get Chapter 4 (&ldquo;Coffee&rdquo;, 23 pp) free as a print PDF + print launch notification.
              </p>
              <form onSubmit={submit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="flex-1 min-w-0 bg-paper border-2 border-ink px-3 py-2 text-sm focus:border-primary outline-none"
                />
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="shrink-0 bg-primary border-2 border-ink px-3 py-2 font-mono text-xs font-bold uppercase hover:bg-ink hover:text-white transition-colors disabled:opacity-60"
                >
                  {state === "loading" ? "..." : "Send it"}
                </button>
              </form>
              {state === "error" && (
                <p className="text-xs text-red-600 mt-2">{message}</p>
              )}
              <a
                href={`${DIET_SITE_URL}/book`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 font-mono text-[10px] font-bold uppercase underline text-ink hover:text-primary"
              >
                Full Contents &amp; 18×24 Prints ↗
              </a>
            </>
          ) : (
            <div>
              <p className="text-xs text-ink-muted leading-relaxed mb-3">{message}</p>
              <a
                href="/book/sample-chapter-coffee.pdf"
                download="The-Ray-Peat-Diet-Chapter-4-Coffee.pdf"
                className="inline-flex items-center gap-2 bg-ink text-white border-2 border-ink px-4 py-2 font-mono text-xs font-bold uppercase hover:bg-primary hover:text-ink transition-colors"
              >
                <span className="material-symbols-outlined text-base">download</span>
                Download Chapter 4 PDF
              </a>
              <div className="mt-3">
                <a
                  href={`${DIET_SITE_URL}/merch`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] font-bold uppercase underline text-ink hover:text-primary"
                >
                  Browse Companion 18×24 Prints ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
