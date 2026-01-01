"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface RAGSource {
  text: string;
  section_header: string;
  section_anchor: string;
  episode_title: string;
  episode_id: string;
  show: string;
  date_published: string | null;
  audio_url: string | null;
  score: number;
}

interface RAGResponse {
  answer: string;
  sources: RAGSource[];
  query: string;
}

interface Email {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  sources?: RAGSource[];
  isUser: boolean;
}

const SAMPLE_SUBJECTS = [
  "Question about thyroid and metabolism",
  "How does serotonin affect the body?",
  "Ray Peat's views on aspirin",
  "Understanding estrogen dominance",
];

function formatEmailDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AskPeatPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [view, setView] = useState<"compose" | "inbox">("compose");
  const emailIdRef = useRef(0);

  const handleSend = async () => {
    if (!body.trim() || isLoading) return;

    const newEmail: Email = {
      id: ++emailIdRef.current,
      from: "you@reader.com",
      to: "ask@raypeat.wiki",
      subject: subject || "Research Question",
      body: body,
      date: formatEmailDate(),
      isUser: true,
    };

    setEmails((prev) => [newEmail, ...prev]);
    setSubject("");
    setBody("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: body, limit: 12 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get response");
      }

      const data: RAGResponse = await response.json();

      const replyEmail: Email = {
        id: ++emailIdRef.current,
        from: "Dr. Peat AI <ask@raypeat.wiki>",
        to: "you@reader.com",
        subject: `Re: ${newEmail.subject}`,
        body: data.answer,
        date: formatEmailDate(),
        sources: data.sources,
        isUser: false,
      };

      setEmails((prev) => [replyEmail, ...prev]);
      setSelectedEmail(replyEmail);
      setView("inbox");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-ink font-body antialiased">
      {/* Header */}
      <header className="w-full border-b-2 border-ink bg-paper sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="material-symbols-outlined text-3xl text-primary group-hover:rotate-12 transition-transform duration-300">
              auto_stories
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
              EncycloPEATia
            </h1>
          </Link>
          <nav className="hidden md:flex gap-8 items-center">
            <Link
              href="/podcasts"
              className="font-mono text-sm font-medium hover:underline decoration-2 underline-offset-4"
            >
              ARCHIVE
            </Link>
            <Link
              href="/encyclopedia"
              className="font-mono text-sm font-medium hover:underline decoration-2 underline-offset-4"
            >
              ENCYCLOPEDIA
            </Link>
            <Link href="/ask" className="btn-primary">
              ASK PEAT
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-block bg-primary text-ink font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 border-2 border-ink shadow-hard-sm mb-4">
            AI-Powered Research
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-[0.95] mb-4">
            Ask <span className="text-primary">Peat</span>
          </h1>
          <p className="text-ink-muted text-lg max-w-xl">
            Ask questions and get AI-synthesized answers from 770+ transcripts,
            newsletters, and articles from Ray Peat&apos;s archive.
          </p>
        </div>

        {/* Important Disclaimer */}
        <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-600 rounded flex gap-3 items-start">
          <span className="material-symbols-outlined text-amber-600 flex-shrink-0">
            info
          </span>
          <div className="text-sm">
            <p className="font-bold text-amber-800 mb-1">
              This is not Ray Peat.
            </p>
            <p className="text-amber-700">
              Responses are AI-generated summaries based on Ray Peat&apos;s
              published work. They may contain errors or misrepresentations.
              Always verify with original sources and consult qualified
              professionals for health decisions.
            </p>
          </div>
        </div>

        {/* Email Client */}
        <div className="bg-surface border-2 border-ink shadow-hard">
          {/* Toolbar */}
          <div className="border-b-2 border-ink px-4 py-3 flex items-center justify-between bg-paper-dim">
            <div className="flex gap-2">
              <button
                onClick={() => setView("compose")}
                className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase border-2 transition-all ${
                  view === "compose"
                    ? "bg-primary border-ink text-ink shadow-hard-sm"
                    : "bg-paper border-ink/30 hover:border-ink"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  edit
                </span>
                Compose
              </button>
              <button
                onClick={() => setView("inbox")}
                className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase border-2 transition-all ${
                  view === "inbox"
                    ? "bg-primary border-ink text-ink shadow-hard-sm"
                    : "bg-paper border-ink/30 hover:border-ink"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  inbox
                </span>
                Inbox ({emails.filter((e) => !e.isUser).length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[500px]">
            {view === "compose" ? (
              /* Compose View */
              <div className="p-6">
                <div className="space-y-4">
                  {/* To Field */}
                  <div className="flex items-center gap-4 pb-4 border-b border-ink/10">
                    <label className="w-16 font-mono text-xs font-bold uppercase text-ink-muted">
                      To:
                    </label>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">
                        smart_toy
                      </span>
                      <span className="font-medium">
                        dr.peat@encyclopeatia.com
                      </span>
                      <span className="text-xs text-ink-muted">
                        (AI Research Assistant)
                      </span>
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="flex items-center gap-4 pb-4 border-b border-ink/10">
                    <label className="w-16 font-mono text-xs font-bold uppercase text-ink-muted">
                      Subject:
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="What's your question about?"
                      className="flex-1 bg-transparent border-none focus:ring-0 font-medium placeholder:text-ink-muted/50"
                    />
                  </div>

                  {/* Body */}
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Dear Dr. Peat,

I have a question about..."
                    rows={10}
                    className="w-full bg-paper border-2 border-ink/20 focus:border-ink p-4 font-body resize-none focus:ring-0 focus:shadow-hard-sm transition-all"
                  />

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex gap-2">
                      {SAMPLE_SUBJECTS.slice(0, 2).map((s, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSubject(s);
                            setBody(
                              `Dear Dr. Peat,\n\nI'd like to learn more about ${s.toLowerCase()}. What are your thoughts on this topic?\n\nThank you.`,
                            );
                          }}
                          className="text-xs px-3 py-1.5 bg-paper-dim border border-ink/20 hover:border-primary hover:text-primary transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSubject("");
                          setBody("");
                        }}
                        className="px-4 py-2 font-mono text-xs font-bold uppercase border-2 border-ink/30 hover:border-ink transition-all"
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={!body.trim() || isLoading}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <span className="material-symbols-outlined text-base animate-spin">
                              progress_activity
                            </span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-base">
                              send
                            </span>
                            Send
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 text-red-700 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">
                        error
                      </span>
                      {error}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Inbox View */
              <div className="flex h-[500px]">
                {/* Email List */}
                <div className="w-1/3 border-r-2 border-ink overflow-y-auto">
                  {emails.length === 0 ? (
                    <div className="p-6 text-center text-ink-muted">
                      <span className="material-symbols-outlined text-4xl mb-2 block">
                        inbox
                      </span>
                      <p className="text-sm">No messages yet</p>
                    </div>
                  ) : (
                    emails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className={`p-4 border-b border-ink/10 cursor-pointer transition-all ${
                          selectedEmail?.id === email.id
                            ? "bg-primary/10 border-l-4 border-l-primary"
                            : "hover:bg-paper-dim"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-sm">
                            {email.isUser ? "send" : "mark_email_read"}
                          </span>
                          <span className="font-mono text-xs font-bold uppercase">
                            {email.isUser ? "Sent" : "From Dr. Peat"}
                          </span>
                        </div>
                        <p className="font-medium text-sm truncate">
                          {email.subject}
                        </p>
                        <p className="text-xs text-ink-muted mt-1">
                          {email.date}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Email Preview */}
                <div className="flex-1 overflow-y-auto">
                  {selectedEmail ? (
                    <div className="p-6">
                      {/* Email Header */}
                      <div className="bg-paper-dim border-2 border-ink/10 p-4 mb-6">
                        <div className="grid grid-cols-[60px_1fr] gap-2 text-sm">
                          <span className="font-mono text-xs font-bold uppercase text-ink-muted">
                            From:
                          </span>
                          <span>{selectedEmail.from}</span>
                          <span className="font-mono text-xs font-bold uppercase text-ink-muted">
                            To:
                          </span>
                          <span>{selectedEmail.to}</span>
                          <span className="font-mono text-xs font-bold uppercase text-ink-muted">
                            Subject:
                          </span>
                          <span className="font-bold">
                            {selectedEmail.subject}
                          </span>
                          <span className="font-mono text-xs font-bold uppercase text-ink-muted">
                            Date:
                          </span>
                          <span>{selectedEmail.date}</span>
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="prose prose-sm max-w-none mb-6">
                        {selectedEmail.isUser ? (
                          <p className="whitespace-pre-wrap">
                            {selectedEmail.body}
                          </p>
                        ) : (
                          <ReactMarkdown>{selectedEmail.body}</ReactMarkdown>
                        )}
                      </div>

                      {/* Sources (Attachments) */}
                      {selectedEmail.sources &&
                        selectedEmail.sources.length > 0 && (
                          <div className="pt-6 border-t-2 border-ink/10">
                            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-ink-muted mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-base">
                                attach_file
                              </span>
                              Sources ({selectedEmail.sources.length} transcript
                              references)
                            </h4>
                            <div className="grid gap-2">
                              {selectedEmail.sources
                                .slice(0, 6)
                                .map((source, j) => (
                                  <Link
                                    key={j}
                                    href={`/episode/${source.episode_id}`}
                                    className="block p-3 bg-paper-dim border-2 border-ink/10 hover:border-primary hover:bg-primary/5 transition-all group"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                          {source.episode_title}
                                        </p>
                                        <p className="text-xs text-ink-muted mt-1">
                                          Section: &quot;{source.section_header}
                                          &quot; • {source.show}
                                        </p>
                                      </div>
                                      <span className="material-symbols-outlined text-ink-muted text-sm group-hover:text-primary transition-colors">
                                        open_in_new
                                      </span>
                                    </div>
                                  </Link>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Reply Button */}
                      {!selectedEmail.isUser && (
                        <div className="mt-6 pt-6 border-t-2 border-ink/10">
                          <button
                            onClick={() => setView("compose")}
                            className="btn-primary flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-base">
                              reply
                            </span>
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-ink-muted">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-4xl mb-2 block">
                          mail
                        </span>
                        <p className="text-sm">Select a message to read</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="border-t-2 border-ink px-4 py-2 bg-paper-dim flex justify-between items-center">
            <span className="font-mono text-xs text-ink-muted">
              {emails.length} message{emails.length !== 1 ? "s" : ""}
            </span>
            <span className="font-mono text-xs text-ink-muted flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Connected to EncycloPEATia
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-center text-ink-muted text-xs">
          <p>
            This is an AI research tool based on Ray Peat&apos;s published work.
            <br />
            Responses should not be considered medical advice.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-ink bg-paper-dim py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center font-mono text-xs text-ink-muted">
          <p>© 2024 EncycloPEATia • A community project</p>
        </div>
      </footer>
    </div>
  );
}
