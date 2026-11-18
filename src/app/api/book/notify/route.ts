import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { sendMessage, sampleChapterEmail, agentMailConfigured } from "@/lib/agentmail";

/**
 * POST /api/book/notify  { email, source?, edition?, items? }
 *
 * Shared book & print-shop launch list across raypeat.wiki and raypeatdiet.com.
 * Appends to DATA_DIR/subscribers.json (falls back to ./data or tmpdir) and
 * sends the Chapter 4 ("Coffee") PDF email when AgentMail is configured.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ALLOWED_ORIGINS = new Set([
  "https://raypeatdiet.com",
  "https://www.raypeatdiet.com",
  "https://raypeatdiet.vercel.app",
  "https://raypeat.wiki",
  "https://www.raypeat.wiki",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  if (!origin) return {};
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://raypeatdiet.vercel.app";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

interface SubscriberRecord {
  email: string;
  source: string;
  edition?: string;
  items?: string[];
  at: string;
}

async function appendSubscriber(record: SubscriberRecord): Promise<void> {
  const candidates = [
    process.env.DATA_DIR,
    path.join(process.cwd(), "data"),
    os.tmpdir(),
  ].filter(Boolean) as string[];
  let lastErr: unknown;
  for (const dir of candidates) {
    try {
      const file = path.join(dir, "subscribers.json");
      let list: SubscriberRecord[] = [];
      try {
        list = JSON.parse(await fs.readFile(file, "utf-8"));
      } catch {
        /* first signup or fresh volume */
      }
      const existing = list.find((s) => s.email === record.email);
      if (!existing) {
        list.push(record);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(file, JSON.stringify(list, null, 2));
      } else if (record.items?.length || record.edition) {
        existing.edition = record.edition || existing.edition;
        if (record.items?.length) {
          existing.items = Array.from(new Set([...(existing.items || []), ...record.items]));
        }
        existing.at = record.at;
        await fs.writeFile(file, JSON.stringify(list, null, 2));
      }
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  console.error("[book] all storage targets failed:", lastErr);
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: NextRequest) {
  const headers = corsHeaders(request);
  try {
    let body: { email?: unknown; source?: unknown; edition?: unknown; items?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers });
    }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const source = typeof body.source === "string" ? body.source.slice(0, 60) : "unknown";
    const edition = typeof body.edition === "string" ? body.edition.slice(0, 40) : undefined;
    const items = Array.isArray(body.items)
      ? body.items.filter((x): x is string => typeof x === "string").slice(0, 20)
      : undefined;

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400, headers });
    }

    await appendSubscriber({
      email,
      source,
      ...(edition ? { edition } : {}),
      ...(items?.length ? { items } : {}),
      at: new Date().toISOString(),
    });
    console.log(`[book] signup: ${email} (${source}${edition ? `, ${edition}` : ""}${items?.length ? `, items=${items.length}` : ""})`);

    let emailSent = false;
    if (agentMailConfigured()) {
      const { subject, text, html } = sampleChapterEmail(email);
      emailSent = await sendMessage(email, subject, text, html);
    }

    return NextResponse.json(
      {
        ok: true,
        emailSent,
        download: "/book/sample-chapter-coffee.pdf",
        downloadUrl: "/book/sample-chapter-coffee.pdf",
        message: items?.length
          ? "Reservation recorded — Chapter 4 ('Coffee') is ready below while Printful batch checkout is finalized."
          : "You're on the list. The Chapter 4 ('Coffee') PDF is ready below — print launch links follow first to this list.",
      },
      { headers }
    );
  } catch (error) {
    console.error("[book] error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again shortly." },
      { status: 500, headers }
    );
  }
}
