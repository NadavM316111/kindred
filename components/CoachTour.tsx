"use client";
import { useCallback, useEffect, useState } from "react";
import { C, FONT } from "@/lib/theme";

type Step = { target: string; title: string; body: string };

const STEPS: Step[] = [
  { target: "filters", title: "Who needs you today", body: "Kindred sorts every patient for you. “Call today” is your to-do list. Start here every morning." },
  { target: "first-row", title: "The most urgent person is always first", body: "Each row shows the patient and the one reason they’re flagged, in plain words." },
  { target: "why", title: "Why call today", body: "What Kindred noticed: their watch drifting from their own normal, where they are after chemo, and what they told us." },
  { target: "next-step", title: "What to say", body: "A suggested next step written by AI from their signals, language and living situation." },
  { target: "called", title: "One tap when you’re done", body: "Mark the call. The patient drops off today’s list." },
  { target: "profile", title: "See exactly what they see", body: "Their profile, plus a live preview of their screen in their language." },
  { target: "accuracy", title: "Why you can trust it", body: "Tested on 250 patients it never saw: 76% of ER visits flagged early, a median of 3 days before." },
];

const SEEN_KEY = "kindred-coach-tour-seen";

export default function CoachTour() {
  const [ask, setAsk] = useState(false);
  const [i, setI] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    try { if (!localStorage.getItem(SEEN_KEY)) setTimeout(() => setAsk(true), 700); } catch { setAsk(true); }
    const restart = () => { setAsk(false); setI(0); };
    window.addEventListener("kindred-tour", restart);
    return () => window.removeEventListener("kindred-tour", restart);
  }, []);

  const steps = STEPS.filter((s) => typeof document === "undefined" || document.querySelector(`[data-tour="${s.target}"]`));
  const step = i != null ? steps[i] : null;

  const measure = useCallback(() => {
    if (!step) return setRect(null);
    const el = document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement | null;
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useEffect(() => {
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    const t = setTimeout(measure, 350);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => { clearTimeout(t); window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure, true); };
  }, [step, measure]);

  const finish = () => { setI(null); setAsk(false); try { localStorage.setItem(SEEN_KEY, "1"); } catch {} };

  if (ask) {
    return (
      <div role="dialog" aria-label="Tour offer" style={{ position: "fixed", right: 20, bottom: 20, zIndex: 60, width: "min(360px, calc(100vw - 40px))", background: "#fff", borderRadius: 22, padding: "20px 22px", boxShadow: "0 16px 48px rgba(0,0,0,0.18)", border: `1px solid ${C.line}`, fontFamily: FONT, color: C.ink, animation: "kd-pop 0.25s ease" }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>New to Kindred?</div>
        <p style={{ fontSize: 16, color: C.mute, margin: "6px 0 16px", lineHeight: 1.5 }}>Take a 30-second tour of your call list.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setAsk(false); setI(0); }} style={{ flex: 1, background: C.teal, color: "#fff", border: "none", borderRadius: 14, padding: "12px 16px", fontSize: 16, fontWeight: 800, fontFamily: FONT, cursor: "pointer" }}>Show me</button>
          <button onClick={finish} style={{ flex: 1, background: "#fff", color: C.ink, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 16px", fontSize: 16, fontFamily: FONT, cursor: "pointer" }}>No thanks</button>
        </div>
      </div>
    );
  }

  if (!step) return null;

  const pad = 8;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const boxW = Math.min(340, vw - 32);
  let top = rect ? rect.bottom + 14 : vh / 2 - 90;
  if (rect && top + 200 > vh) top = Math.max(16, rect.top - 214);
  const left = rect ? Math.min(Math.max(16, rect.left), vw - boxW - 16) : vw / 2 - boxW / 2;
  const last = i === steps.length - 1;

  return (
    <>
      <div onClick={finish} style={{ position: "fixed", inset: 0, zIndex: 58 }} />
      {rect && (
        <div style={{
          position: "fixed", zIndex: 59, pointerEvents: "none", left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2,
          borderRadius: 16, boxShadow: `0 0 0 4px ${C.teal}, 0 0 0 9999px rgba(16,24,20,0.55)`, transition: "all 0.3s ease",
        }} />
      )}
      <div role="dialog" aria-label={step.title} style={{ position: "fixed", zIndex: 60, top, left, width: boxW, background: "#fff", borderRadius: 20, padding: "18px 20px", boxShadow: "0 16px 48px rgba(0,0,0,0.25)", fontFamily: FONT, color: C.ink, transition: "top 0.3s ease, left 0.3s ease" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>{(i ?? 0) + 1} of {steps.length}</div>
        <div style={{ fontSize: 19, fontWeight: 800, margin: "4px 0 6px" }}>{step.title}</div>
        <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0, color: C.ink }}>{step.body}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
          <button onClick={finish} style={{ background: "none", border: "none", color: C.mute, fontSize: 15, fontFamily: FONT, cursor: "pointer", padding: 0 }}>Skip</button>
          <div style={{ flex: 1 }} />
          {(i ?? 0) > 0 && <button onClick={() => setI((i ?? 1) - 1)} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: "9px 14px", fontSize: 15, fontFamily: FONT, cursor: "pointer", color: C.ink }}>Back</button>}
          <button onClick={() => (last ? finish() : setI((i ?? 0) + 1))} style={{ background: C.teal, color: "#fff", border: "none", borderRadius: 12, padding: "9px 16px", fontSize: 15, fontWeight: 800, fontFamily: FONT, cursor: "pointer" }}>{last ? "Done" : "Next"}</button>
        </div>
      </div>
    </>
  );
}