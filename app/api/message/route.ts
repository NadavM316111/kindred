import { NextResponse } from "next/server";

type Body = {
  kind: "patient" | "coach";
  level: "red" | "yellow" | "green";
  lang: "English" | "Spanish" | "Haitian Creole";
  risk: number;
  reasons: string[];
  patient: { id: string; age: number; sex: string; cancer: string; stage: string; plan: string; alone: string; miles: number };
};

function prompt(b: Body) {
  const p = b.patient;
  const facts = `Patient ${p.id} (use their first name if you address them): ${p.age}-year-old ${p.sex}, ${p.cancer} cancer stage ${p.stage}, treatment: ${p.plan}. Lives alone: ${p.alone}. ${p.miles} miles from clinic. Risk of a rough patch in the next 3 days: ${Math.round(b.risk * 100)}%. Status: ${b.level}. Reasons from their wearable and check-ins: ${b.reasons.length ? b.reasons.join("; ") : "none, signals are within their normal range"}.`;
  if (b.kind === "patient") {
    return `${facts}

Write a message to this patient in ${b.lang}. Rules: one or two short sentences, then the safety line. 5th-grade reading level. Calm and kind. Never scary, never mention numbers, percentages, or diagnoses. If status is red, say their coach will call them today. If yellow, suggest rest and fluids. If green, encourage their normal routine. Always end with (in ${b.lang}): call your care team if you have a fever or can't keep food down. No em dashes, no emojis. Output only the message.`;
  }
  return `${facts}

Write a note for this patient's health coach in English. 2 or 3 short sentences: why they are flagged in plain words, anything practical (lives alone, distance to clinic, language: ${b.lang}), and one suggested action. No em dashes, no emojis, no headers. Output only the note.`;
}

export async function POST(req: Request) {
  const b = (await req.json()) as Body;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ text: null, source: "no-key" });
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt(b) }],
      }),
    });
    clearTimeout(t);
    if (!r.ok) return NextResponse.json({ text: null, source: "error", detail: await r.text() });
    const j = await r.json();
    const text = (j.content || []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("").trim();
    return NextResponse.json({ text: text || null, source: "ai" });
  } catch (e) {
    return NextResponse.json({ text: null, source: "error", detail: String(e) });
  }
}