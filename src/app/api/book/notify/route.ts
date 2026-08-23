import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

/**
 * POST /api/book/notify  { email, source? }
 *
 * Book launch list. Appends to DATA_DIR/subscribers.json (mount a Railway
 * volume at DATA_DIR for durability across deploys; falls back to ./data and
 * still logs every signup so nothing is lost even without a volume).
 *
 * Returns an instant download link for the sample chapter. Actual email
 * delivery waits on a sending identity (ask-ray@raypeat.wiki via SMTP);
 * this endpoint is provider-agnostic by design.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function appendSubscriber(email: string, source: string): Promise<void> {
  const candidates = [
    process.env.DATA_DIR,
    path.join(process.cwd(), "data"),
    require("os").tmpdir(),
  ].filter(Boolean) as string[];
  let lastErr: unknown;
  for (const dir of candidates) {
    try {
      const file = path.join(dir, "subscribers.json");
      let list: Array<{ email: string; source: string; at: string }> = [];
      try {
        list = JSON.parse(await fs.readFile(file, "utf-8"));
      } catch {
        /* first signup or fresh volume */
      }
      if (!list.some((s) => s.email === email)) {
        list.push({ email, source, at: new Date().toISOString() });
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(file, JSON.stringify(list, null, 2));
      }
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  // Never block the signup on storage failure — Railway logs keep the record.
  console.error("[book] all storage targets failed:", lastErr);
}

export async function POST(request: NextRequest) {
  try {
    let body: { email?: unknown; source?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const source = typeof body.source === "string" ? body.source.slice(0, 40) : "unknown";

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Rate-limit-friendly duplicate handling is inside appendSubscriber.
    await appendSubscriber(email, source);
    console.log(`[book] signup: ${email} (${source})`);

    return NextResponse.json({
      ok: true,
      download: "/book/sample-chapter-coffee.pdf",
      message:
        "You're on the list. The Coffee chapter is yours below — the full deluxe hardback follows at launch.",
    });
  } catch (error) {
    console.error("[book] error:", error);
    return NextResponse.json({ error: "Something went wrong. Try again shortly." }, { status: 500 });
  }
}
