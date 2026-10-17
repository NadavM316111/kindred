"use client";
import { useEffect, useState } from "react";
import type { Patient } from "./data";
import type { Status } from "./status";
import { T } from "./i18n";
import { cacheMsg, useStore } from "./store";
import { effective, langFor, nameFor } from "./names";
import type { State } from "./store";

function coachFallback(p: Patient, s: Status, st: State) {
  const who = nameFor(p, st).first;
  const lang = langFor(p, st);
  const why = s.reasons.length ? s.reasons.map((r) => r.toLowerCase()).join("; ") : "small changes across several signals";
  const extra = [
    p.alone === "yes" ? "Lives alone, so a call today matters more." : "",
    p.miles > 20 ? `Lives ${p.miles} miles from clinic, check transport if they need to come in.` : "",
    lang !== "English" ? `Prefers ${lang}.` : "",
  ].filter(Boolean).join(" ");
  if (s.level === "red") return `${who} is likely heading into a rough patch: ${why}. ${extra} Suggest a short check-in call today.`.replace(/\s+/g, " ");
  if (s.level === "yellow") return `${who} is drifting a bit from their normal. ${extra} No call needed yet, keep an eye on tomorrow.`.replace(/\s+/g, " ");
  return `${who} looks steady and within their normal range. No action needed.`;
}

// Returns an AI-written message (cached per patient, date and status), with a safe fallback.
export function useMessage(raw: Patient | undefined, s: Status | null, date: string, kind: "patient" | "coach") {
  const st = useStore();
    const p = raw ? effective(raw, st) : undefined;
  const level = s?.level === "none" || !s ? "green" : s.level;
  const lang = p ? langFor(p, st) : "English";
  const who = p ? nameFor(p, st).full : "";
  const key = p ? `${kind}:${p.id}:${who}:${lang}:${date}:${level}:${s?.reasons.join("|")}` : "";
  const cached = key ? st.msgs[key] : undefined;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!p || !s || s.level === "none" || cached) return;
    let alive = true;
    setLoading(true);
    fetch("/api/message", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind, level, lang, risk: s.risk, reasons: s.reasons,
        patient: { id: who, age: p.age, sex: p.sex, cancer: p.cancer, stage: p.stage, plan: p.plan, alone: p.alone, miles: p.miles },
      }),
    })
      .then((r) => r.json())
      .then((j) => { if (alive && j.text) cacheMsg(key, j.text); })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p || !s) return { text: "", loading: false };
  const fallback = kind === "patient" ? T[lang].fallback[level] : coachFallback(p, s, st);
  return { text: cached || fallback, loading: loading && !cached };
}