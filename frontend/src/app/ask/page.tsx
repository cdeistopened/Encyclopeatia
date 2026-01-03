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

const SENDING_MESSAGES = [
  "Connecting to mail server...",
  "Authenticating...",
  "Uploading message...",
  "Searching transcript archives...",
  "Consulting the bioenergetic literature...",
  "Formulating response...",
  "Delivering reply...",
];

function formatEmailDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Win95Button({ children, onClick, disabled, primary }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-1 text-sm font-bold
        ${primary ? "bg-[#000080] text-white" : "bg-[#c0c0c0] text-black"}
        border-t-2 border-l-2 border-[#ffffff]
        border-b-2 border-r-2 border-[#808080]
        active:border-t-[#808080] active:border-l-[#808080]
        active:border-b-[#ffffff] active:border-r-[#ffffff]
        disabled:opacity-50 disabled:cursor-not-allowed
        font-['MS_Sans_Serif',_'Segoe_UI',_sans-serif]
      `}
    >
      {children}
    </button>
  );
}

function Win95Window({ title, children, onClose }: {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-[#ffffff] border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] shadow-lg">
      {/* Title Bar */}
      <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <svg viewBox="0 0 16 16" className="w-4 h-4">
              <rect x="1" y="3" width="14" height="10" fill="#ffff00" stroke="#000" strokeWidth="1"/>
              <polygon points="1,3 8,8 15,3" fill="#c0c000"/>
            </svg>
          </div>
          <span className="text-white text-sm font-bold font-['MS_Sans_Serif',_'Segoe_UI',_sans-serif]">
            {title}
          </span>
        </div>
        <div className="flex gap-1">
          <button className="w-4 h-4 bg-[#c0c0c0] border border-[#ffffff] border-b-[#808080] border-r-[#808080] text-xs font-bold flex items-center justify-center">
            _
          </button>
          <button className="w-4 h-4 bg-[#c0c0c0] border border-[#ffffff] border-b-[#808080] border-r-[#808080] text-xs font-bold flex items-center justify-center">
            □
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-4 h-4 bg-[#c0c0c0] border border-[#ffffff] border-b-[#808080] border-r-[#808080] text-xs font-bold flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>
      </div>
      {/* Content */}
      <div className="p-1">
        {children}
      </div>
    </div>
  );
}

function SendingAnimation({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Win95Window title="Sending Message...">
        <div className="bg-[#c0c0c0] p-6 min-w-[300px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="animate-spin">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <circle cx="12" cy="12" r="10" fill="none" stroke="#000080" strokeWidth="2" strokeDasharray="20 40"/>
              </svg>
            </div>
            <span className="text-sm font-['MS_Sans_Serif',_'Segoe_UI',_sans-serif]">{message}</span>
          </div>
          {/* Progress bar */}
          <div className="h-4 bg-white border-2 border-[#808080] border-t-[#404040]">
            <div className="h-full bg-[#000080] animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      </Win95Window>
    </div>
  );
}

export default function AskPeatPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [view, setView] = useState<"inbox" | "compose">("compose");
  const emailIdRef = useRef(0);

  // Cycle through loading messages
  useEffect(() => {
    if (!isLoading) return;

    let index = 0;
    setLoadingMessage(SENDING_MESSAGES[0]);

    const interval = setInterval(() => {
      index = (index + 1) % SENDING_MESSAGES.length;
      setLoadingMessage(SENDING_MESSAGES[index]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSend = async () => {
    if (!body.trim() || isLoading) return;

    const userEmail: Email = {
      id: ++emailIdRef.current,
      from: "you@raypeatradio.local",
      to: "dr.peat@raypeatradio.local",
      subject: subject || "Question",
      body: body,
      date: formatEmailDate(),
      isUser: true,
    };

    setEmails((prev) => [userEmail, ...prev]);
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
        from: "dr.peat@raypeatradio.local",
        to: "you@raypeatradio.local",
        subject: `Re: ${userEmail.subject}`,
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
    <main className="min-h-screen bg-[#008080] p-4 md:p-8 font-['MS_Sans_Serif',_'Segoe_UI',_sans-serif]">
      {isLoading && <SendingAnimation message={loadingMessage} />}

      <div className="max-w-4xl mx-auto">
        {/* Main Email Window */}
        <Win95Window title="Peat Mail - [Ask Dr. Peat]">
          {/* Menu Bar */}
          <div className="bg-[#c0c0c0] border-b border-[#808080] px-2 py-1 flex gap-4 text-sm">
            <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer">File</span>
            <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer">Edit</span>
            <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer">View</span>
            <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer">Help</span>
          </div>

          {/* Toolbar */}
          <div className="bg-[#c0c0c0] border-b border-[#808080] px-2 py-2 flex gap-2">
            <Win95Button onClick={() => setView("compose")} primary={view === "compose"}>
              New Mail
            </Win95Button>
            <Win95Button onClick={() => setView("inbox")} primary={view === "inbox"}>
              Inbox ({emails.filter(e => !e.isUser).length})
            </Win95Button>
          </div>

          {/* Content Area */}
          <div className="bg-white min-h-[500px]">
            {view === "compose" ? (
              /* Compose View */
              <div className="p-4">
                <div className="space-y-3">
                  {/* To Field */}
                  <div className="flex items-center gap-2">
                    <label className="w-16 text-sm font-bold text-right">To:</label>
                    <input
                      type="text"
                      value="dr.peat@raypeatradio.local"
                      readOnly
                      className="flex-1 px-2 py-1 bg-[#c0c0c0] border-2 border-[#808080] border-t-[#404040] text-sm"
                    />
                  </div>

                  {/* Subject Field */}
                  <div className="flex items-center gap-2">
                    <label className="w-16 text-sm font-bold text-right">Subject:</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Your question about health, metabolism, etc."
                      className="flex-1 px-2 py-1 border-2 border-[#808080] border-t-[#404040] text-sm"
                    />
                  </div>

                  {/* Body */}
                  <div className="flex gap-2">
                    <label className="w-16 text-sm font-bold text-right pt-1">Body:</label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Dear Dr. Peat,&#10;&#10;I have a question about..."
                      rows={12}
                      className="flex-1 px-2 py-1 border-2 border-[#808080] border-t-[#404040] text-sm resize-none font-mono"
                    />
                  </div>

                  {/* Send Button */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Win95Button onClick={() => { setSubject(""); setBody(""); }}>
                      Clear
                    </Win95Button>
                    <Win95Button onClick={handleSend} disabled={!body.trim() || isLoading} primary>
                      Send
                    </Win95Button>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-[#ffcccc] border-2 border-[#ff0000] text-sm">
                      Error: {error}
                    </div>
                  )}
                </div>

                {/* Example Questions */}
                <div className="mt-6 pt-4 border-t border-[#808080]">
                  <p className="text-sm font-bold mb-2">Sample questions you can ask:</p>
                  <div className="grid gap-1 text-sm">
                    {[
                      "What does Ray Peat say about thyroid and metabolism?",
                      "How does serotonin affect inflammation?",
                      "What are Ray Peat's views on aspirin?",
                      "How does estrogen affect the body?",
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setBody(q)}
                        className="text-left px-2 py-1 hover:bg-[#000080] hover:text-white text-[#000080] underline"
                      >
                        • {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Inbox View */
              <div className="flex h-[500px]">
                {/* Email List */}
                <div className="w-1/3 border-r border-[#808080] overflow-y-auto">
                  {emails.length === 0 ? (
                    <div className="p-4 text-sm text-[#808080] text-center">
                      No messages yet
                    </div>
                  ) : (
                    emails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className={`p-2 border-b border-[#c0c0c0] cursor-pointer ${
                          selectedEmail?.id === email.id
                            ? "bg-[#000080] text-white"
                            : "hover:bg-[#c0c0c0]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {!email.isUser && (
                            <span className="text-xs">📧</span>
                          )}
                          {email.isUser && (
                            <span className="text-xs">📤</span>
                          )}
                          <span className="font-bold text-sm truncate">
                            {email.isUser ? "To: Dr. Peat" : "From: Dr. Peat"}
                          </span>
                        </div>
                        <div className="text-xs truncate">{email.subject}</div>
                        <div className="text-xs opacity-70">{email.date}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Email Preview */}
                <div className="flex-1 overflow-y-auto">
                  {selectedEmail ? (
                    <div className="p-4">
                      {/* Email Header */}
                      <div className="bg-[#c0c0c0] p-3 mb-4 border-2 border-[#ffffff] border-b-[#808080] border-r-[#808080]">
                        <div className="text-sm">
                          <strong>From:</strong> {selectedEmail.from}
                        </div>
                        <div className="text-sm">
                          <strong>To:</strong> {selectedEmail.to}
                        </div>
                        <div className="text-sm">
                          <strong>Subject:</strong> {selectedEmail.subject}
                        </div>
                        <div className="text-sm">
                          <strong>Date:</strong> {selectedEmail.date}
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="prose prose-sm max-w-none mb-4 font-mono text-sm whitespace-pre-wrap">
                        {selectedEmail.isUser ? (
                          selectedEmail.body
                        ) : (
                          <ReactMarkdown>{selectedEmail.body}</ReactMarkdown>
                        )}
                      </div>

                      {/* Sources (Attachments) */}
                      {selectedEmail.sources && selectedEmail.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#808080]">
                          <div className="text-sm font-bold mb-2">
                            📎 Attachments ({selectedEmail.sources.length} transcript references):
                          </div>
                          <div className="grid gap-2">
                            {selectedEmail.sources.slice(0, 6).map((source, j) => (
                              <div
                                key={j}
                                className="p-2 bg-[#ffffcc] border border-[#808080] text-sm"
                              >
                                <div className="font-bold truncate">
                                  📄 {source.episode_title}
                                </div>
                                <div className="text-xs text-[#808080]">
                                  Section: &quot;{source.section_header}&quot; • {source.show}
                                </div>
                                <Link
                                  href={`/episode/${encodeURIComponent(source.episode_id)}`}
                                  className="text-xs text-[#000080] underline hover:text-[#ff0000]"
                                >
                                  Open transcript →
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reply Button */}
                      {!selectedEmail.isUser && (
                        <div className="mt-4 pt-4 border-t border-[#808080]">
                          <Win95Button onClick={() => setView("compose")} primary>
                            Reply
                          </Win95Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#808080] text-sm">
                      Select a message to read
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="bg-[#c0c0c0] border-t border-[#ffffff] px-2 py-1 text-xs flex justify-between">
            <span>{emails.length} message(s)</span>
            <span>Connected to raypeatradio.local</span>
          </div>
        </Win95Window>

        {/* Disclaimer */}
        <div className="mt-4 text-center text-white/80 text-xs">
          <p>
            This is an AI simulation based on Ray Peat&apos;s podcast transcripts.
            <br />
            Responses are generated by AI and should not be considered medical advice.
          </p>
        </div>
      </div>
    </main>
  );
}
