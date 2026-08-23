/**
 * AgentMail (agentmail.to) — the site's sending identity.
 *
 * Activates when OPENROUTER-style env vars land on Railway:
 *   AGENTMAIL_API_KEY   — from the agentmail.to dashboard
 *   AGENTMAIL_INBOX_ID  — e.g. "askray@raypeat.wiki" once the domain is verified
 *
 * Unconfigured = every send returns false and the caller falls back to the
 * instant-download flow, which works with zero dependencies.
 */

const API = "https://api.agentmail.to/v0";

export function agentMailConfigured(): boolean {
  return !!(process.env.AGENTMAIL_API_KEY && process.env.AGENTMAIL_INBOX_ID);
}

export async function sendMessage(to: string, subject: string, text: string, html: string): Promise<boolean> {
  if (!agentMailConfigured()) return false;
  const key = process.env.AGENTMAIL_API_KEY!;
  const inboxId = process.env.AGENTMAIL_INBOX_ID!;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(`${API}/inboxes/${encodeURIComponent(inboxId)}/messages`, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ to: [to], subject, text, html }),
    });
    if (!res.ok) {
      console.error(`[agentmail] send failed ${res.status}:`, (await res.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[agentmail] send error:", e);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function sampleChapterEmail(email: string): { subject: string; text: string; html: string } {
  const download = "https://raypeat.wiki/book/sample-chapter-coffee.pdf";
  return {
    subject: "The Coffee chapter — The Ray Peat Diet",
    text: `Thanks for signing up at raypeat.wiki.

Your sample chapter is here:
${download}

This is the Coffee section of The Ray Peat Diet — Ray in his own words,
every claim traced back to a source. The deluxe hardback follows at
launch; you're on the list.

- raypeat.wiki

P.S. This is not Ray Peat. Every word is assembled exclusively from his
published writings and interviews — raypeat.com and his books are always
the primary sources.`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#15181e;">
<p>Thanks for signing up at <strong>raypeat.wiki</strong>.</p>
<p><a href="${download}" style="display:inline-block;background:#f0c742;border:2px solid #15181e;padding:10px 18px;font-weight:bold;text-decoration:none;color:#15181e;">Download the Coffee chapter (PDF)</a></p>
<p>This is the <em>Coffee</em> section of <strong>The Ray Peat Diet</strong> — Ray in his own words, every claim traced back to a source. The deluxe hardback follows at launch; you're on the list.</p>
<hr style="border:none;border-top:2px solid #15181e;margin:24px 0;" />
<p style="font-size:12px;color:#666;">This is not Ray Peat. Every word is assembled exclusively from his published writings and interviews — <a href="https://raypeat.com">raypeat.com</a> and his books are always the primary sources.</p>
</div>`,
  };
}
