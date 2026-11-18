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
  const recipientNote = email ? `Sent to ${email}. ` : "";
  return {
    subject: "Chapter 4: Coffee — The Elusive Quest for the Ray Peat Diet",
    text: `Thanks for signing up at raypeat.wiki / raypeatdiet.com.

Your free sample chapter from The Elusive Quest for the Ray Peat Diet (A Guide to Food, Energy, and Vitality in His Own Words) is ready here:
${download}

This 348-page First Edition braids fifty years of Raymond Peat, PhD's newsletters, radio interviews, and letters into 13 chapters with 346 source notes. Paperback ($24.95) and Deluxe Hardcover ($34.95) launch links will go to this list first.

Questions or feedback? Reply or write askray@raypeat.wiki.

- Charlie Deist / raypeat.wiki

P.S. Independent compilation — this is not Ray Peat (1936–2022), and is not affiliated with or endorsed by his estate. RayPeat.com and his books are always the primary sources.`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#15181e;">
<p>Thanks for signing up.</p>
<p><a href="${download}" style="display:inline-block;background:#f0c742;border:2px solid #15181e;padding:10px 18px;font-weight:bold;text-decoration:none;color:#15181e;">Download Chapter 4: Coffee (PDF)</a></p>
<p>This sample comes straight from <strong>The Elusive Quest for the Ray Peat Diet: A Guide to Food, Energy, and Vitality in His Own Words</strong> (348 pages, 13 chapters, 346 numbered source notes — Paperback $24.95 &amp; Deluxe Hardcover $34.95).</p>
<p style="font-size:13px;color:#444;">Questions? Write <a href="mailto:askray@raypeat.wiki">askray@raypeat.wiki</a>.</p>
<hr style="border:none;border-top:2px solid #15181e;margin:24px 0;" />
<p style="font-size:12px;color:#666;">${recipientNote}Independent compilation edited by Charlie Deist. Not Ray Peat (1936–2022), and not affiliated with or endorsed by his estate. <a href="https://raypeat.com">RayPeat.com</a> and his books are always the primary sources.</p>
</div>`,
  };
}
