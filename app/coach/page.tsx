"use client";
import { useMemo, useState } from "react";
import Chart from "@/components/Chart";
import { F, Patient, cap, useData } from "@/lib/data";
import { bodyTiles } from "@/lib/body";
import { effective, langFor, nameFor } from "@/lib/names";
import PatientHome from "@/components/PatientHome";
import CoachTour from "@/components/CoachTour";
import { Status, levelRank, statusFor } from "@/lib/status";
import { markCalled, useStore } from "@/lib/store";
import { useMessage } from "@/lib/useMessage";
import { C, FONT, SHADOW, levelColor } from "@/lib/theme";

const tagText = { red: "Call today", yellow: "Watch", green: "Okay", none: "" };
type Filter = "all" | "red" | "yellow";

function oneLine(s: Status) {
  if (s.level === "red") return s.reasons[0] || "Several small changes at once";
  if (s.level === "yellow") return "Drifting a little from their normal";
  return "Steady";
}

export default function Coach() {
  const data = useData();
  const st = useStore();
  const [filter, setFilter] = useState<Filter>("red");
  const [selId, setSelId] = useState<string | null>(null);
  const date = st.demoDate;

  const rows = useMemo(() => {
    if (!data) return [];
    return data.patients
      .map((raw) => { const p = effective(raw, st); return { p, s: statusFor(p, date, st) }; })
      .filter((r) => r.s.level !== "none")
      .sort((a, b) => levelRank[a.s.level] - levelRank[b.s.level] || b.s.risk - a.s.risk);
  }, [data, date, st]);

  if (!data) return <main style={{ padding: 40, fontFamily: FONT }}>Loading...</main>;

  const counts = { red: rows.filter((r) => r.s.level === "red").length, yellow: rows.filter((r) => r.s.level === "yellow").length };
  const shown = rows.filter((r) => filter === "all" || r.s.level === filter);
  const sel = rows.find((r) => r.p.id === selId) || shown[0] || rows[0] || null;

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "26px 16px 56px", fontFamily: FONT, color: C.ink }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ fontSize: 34, margin: 0 }}>Today</h1>
        <button onClick={() => window.dispatchEvent(new Event("kindred-tour"))} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 99, padding: "8px 14px", fontSize: 15, fontFamily: FONT, cursor: "pointer", color: C.ink }}>Take the tour</button>
      </div>
      <p style={{ margin: "4px 0 18px", color: C.mute, fontSize: 18 }}>
        {counts.red === 0 ? "Nobody needs a call today." : <><b style={{ color: C.red }}>{counts.red} {counts.red === 1 ? "person needs" : "people need"} a call</b> before their next appointment.</>}
      </p>

      <div data-tour="filters" style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", width: "fit-content" }}>
        {([["red", `Call today (${counts.red})`], ["yellow", `Watch (${counts.yellow})`], ["all", `Everyone (${rows.length})`]] as [Filter, string][]).map(([f, label]) => (
          <button key={f} onClick={() => { setFilter(f); setSelId(null); }} style={{
            padding: "10px 16px", borderRadius: 99, fontSize: 16, fontWeight: 700, fontFamily: FONT, cursor: "pointer",
            border: `1px solid ${filter === f ? C.ink : C.line}`, background: filter === f ? C.ink : "#fff", color: filter === f ? "#fff" : C.ink,
          }}>{label}</button>
        ))}
      </div>

      <div className="kd-grid" style={{ display: "grid", gridTemplateColumns: "minmax(280px, 400px) 1fr", gap: 20, alignItems: "start" }}>
        <style>{`@media (max-width: 880px){ .kd-grid{ grid-template-columns: 1fr !important; } }`}</style>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 230px)", overflowY: "auto", paddingRight: 4 }}>
          {shown.length === 0 && <p style={{ color: C.mute, fontSize: 17, padding: 12 }}>Nobody here today.</p>}
          {shown.slice(0, 100).map(({ p, s }, rowIdx) => {
            const on = sel?.p.id === p.id;
            const col = levelColor[s.level];
            const n = nameFor(p, st);
            return (
              <button key={p.id} data-tour={rowIdx === 0 ? "first-row" : undefined} onClick={() => setSelId(p.id)} style={{
                display: "flex", gap: 12, alignItems: "center", textAlign: "left", width: "100%", padding: "14px 14px",
                borderRadius: 18, border: `1.5px solid ${on ? C.teal : C.line}`, background: "#fff", cursor: "pointer",
                boxShadow: on ? SHADOW : "none", fontFamily: FONT, color: C.ink,
              }}>
                <span style={{ width: 44, height: 44, borderRadius: 99, background: col.soft, color: col.main, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{n.first[0]}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: 17, display: "block" }}>{n.full}</b>
                  <span style={{ display: "block", fontSize: 14, color: C.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{oneLine(s)}</span>
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, padding: "5px 10px", borderRadius: 99, background: col.soft, color: col.main, whiteSpace: "nowrap" }}>{tagText[s.level]}</span>
              </button>
            );
          })}
        </div>

        {sel ? <Detail key={sel.p.id + date} p={sel.p} s={sel.s} date={date} /> : <div />}
      </div>
      <CoachTour />
    </main>
  );
}

function Detail({ p, s, date }: { p: Patient; s: Status; date: string }) {
  const st = useStore();
  const [showData, setShowData] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const coach = useMessage(p, s, date, "coach");
  const col = levelColor[s.level];
  const n = nameFor(p, st);
  const lang = langFor(p, st);
  const i = s.dayIndex;
  const tiles = bodyTiles(p, i);
  const fromPatient = [
    ...(st.urgent[p.id] || []).filter((d) => d <= date).map((d) => ({ d, text: "Pressed “I don’t feel well”", red: true })),
    ...Object.entries(st.checkins[p.id] || {}).filter(([d]) => d <= date).map(([d, v]) => ({ d, text: `Said they feel ${["awful", "bad", "okay", "good", "great"][v - 1]}`, red: v <= 2 })),
  ].sort((a, b) => (a.d < b.d ? 1 : -1)).slice(0, 4);

  const tileWord = (k: string, tr: string) =>
    tr === "none" ? "No data" : tr === "usual" ? "Usual" : k === "heart" ? (tr === "higher" ? "Faster than usual" : "Slower than usual") : tr === "lower" ? "Less than usual" : "More than usual";
  const tileBad = (k: string, tr: string) => (k === "heart" ? tr === "higher" : tr === "lower");

  return (
    <section style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 24, padding: "24px 24px 20px", boxShadow: SHADOW, animation: "kd-in 0.25s ease" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ width: 60, height: 60, borderRadius: 99, background: col.soft, color: col.main, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 26 }}>{n.first[0]}</span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 28, margin: 0 }}>{n.full}</h2>
          <p style={{ margin: "2px 0 0", color: C.mute, fontSize: 16 }}>{p.age}, {cap(p.cancer)} cancer, {p.plan}. Speaks {lang}.{p.alone === "yes" ? " Lives alone." : ""}</p>
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, padding: "8px 16px", borderRadius: 99, background: col.main, color: "#fff" }}>{tagText[s.level]}</span>
      </div>

      <div data-tour="why" style={{ marginTop: 20, padding: "18px 20px", borderRadius: 18, background: col.soft }}>
        <h3 style={{ fontSize: 18, margin: "0 0 8px" }}>{s.level === "red" ? "Why call today" : "How they’re doing"}</h3>
        {s.reasons.length ? (
          <ul style={{ margin: 0, paddingLeft: 22, fontSize: 17, lineHeight: 1.7 }}>{s.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        ) : <p style={{ margin: 0, fontSize: 17 }}>{s.level === "yellow" ? "Drifting a little from their normal. No call needed yet." : "Within their normal range."}</p>}
      </div>

      <div data-tour="next-step" style={{ marginTop: 14, padding: "16px 20px", borderRadius: 18, border: `1px solid ${C.line}` }}>
        <h3 style={{ fontSize: 16, margin: "0 0 6px", color: C.mute }}>Suggested next step {coach.loading && "(writing...)"}</h3>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55 }}>{coach.text}</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        {s.level === "red" && !s.calledToday && (
          <button data-tour="called" onClick={() => markCalled(p.id, date)} style={{ flex: "1 1 200px", background: C.teal, color: "#fff", border: "none", borderRadius: 16, padding: "16px 20px", fontSize: 18, fontWeight: 800, fontFamily: FONT, cursor: "pointer" }}>
            I called {n.first}
          </button>
        )}
        {s.calledToday && <span style={{ flex: "1 1 200px", padding: "16px 20px", borderRadius: 16, background: C.greenSoft, color: C.green, fontWeight: 800, fontSize: 18, textAlign: "center" }}>Called today</span>}
        <button data-tour="profile" onClick={() => setProfileOpen(true)} style={{ flex: "1 1 200px", border: `1px solid ${C.line}`, background: "#fff", borderRadius: 16, padding: "16px 20px", fontSize: 18, fontWeight: 700, color: C.ink, fontFamily: FONT, cursor: "pointer" }}>{n.first}’s profile and screen</button>
      </div>

      <h3 style={{ fontSize: 18, margin: "24px 0 10px" }}>Last 3 days</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {tiles.map((tl) => {
          const bad = tileBad(tl.key, tl.trend);
          return (
            <div key={tl.key} style={{ borderRadius: 16, padding: "14px 14px", background: tl.trend === "none" ? C.soft : bad ? C.yellowSoft : C.greenSoft }}>
              <div style={{ fontSize: 14, color: C.mute }}>{{ steps: "Steps", sleep: "Sleep", heart: "Resting heart" }[tl.key]}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: bad ? "#8A5B00" : tl.trend === "none" ? C.mute : C.green }}>{tileWord(tl.key, tl.trend)}</div>
            </div>
          );
        })}
      </div>

      {fromPatient.length > 0 && (
        <>
          <h3 style={{ fontSize: 18, margin: "22px 0 8px" }}>From {n.first}</h3>
          {fromPatient.map((x) => <div key={x.d + x.text} style={{ fontSize: 16, padding: "4px 0", color: x.red ? C.red : C.ink, fontWeight: x.red ? 700 : 400 }}>{x.text}</div>)}
        </>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <button onClick={() => setShowData(!showData)} style={ghost}>{showData ? "Hide" : "Show"} the data</button>
      </div>

      {showData && (
        <div style={{ marginTop: 6 }}>
          <Chart days={p.days} todayIndex={i} field={F.steps} title="Steps" showFuture={false} />
          <Chart days={p.days} todayIndex={i} field={F.rhr} title="Resting heart rate" unit=" bpm" showFuture={false} />
          <Chart days={p.days} todayIndex={i} field={F.sleep} title="Sleep" unit=" min" showFuture={false} />
          <Chart days={p.days} todayIndex={i} field={F.feel} title="How they said they feel (1 to 5)" showFuture={false} fixed={[1, 5]} dots />
          <p style={{ fontSize: 13, color: C.mute, margin: "8px 0 0" }}>Shaded bars are treatment days. The dark line is today. Risk score: {Math.round(s.risk * 100)}% chance of a rough patch in the next 3 days.</p>
        </div>
      )}

      {profileOpen && <ProfileModal p={p} onClose={() => setProfileOpen(false)} />}
    </section>
  );
}

const ghost: React.CSSProperties = {
  background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 16px", fontSize: 15, fontFamily: FONT, cursor: "pointer", color: C.ink,
};

function ProfileModal({ p, onClose }: { p: Patient; onClose: () => void }) {
  const st = useStore();
  const n = nameFor(p, st);
  const lang = langFor(p, st);
  const rows: [string, string][] = [
    ["Age", String(p.age)],
    ["Sex", cap(p.sex)],
    ["Language", lang],
    ["Cancer", `${cap(p.cancer)}, stage ${p.stage}`],
    ["Treatment", p.plan],
    ["Lives alone", p.alone === "yes" ? "Yes" : "No"],
    ["Distance to clinic", `${p.miles} miles`],
    ["Device", "Fitbit, connected"],
    ["Patient ID", p.id],
  ];
  return (
    <div role="dialog" aria-modal="true" aria-label={`${n.full} profile`} onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(16,24,20,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 28, maxWidth: 980, width: "100%", maxHeight: "92vh", overflowY: "auto", padding: 26, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", animation: "kd-pop 0.2s ease", fontFamily: FONT, color: C.ink }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <span style={{ width: 56, height: 56, borderRadius: 99, background: C.tealSoft, color: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24 }}>{n.first[0]}</span>
          <h2 style={{ fontSize: 28, margin: 0, flex: 1 }}>{n.full}</h2>
          <button onClick={onClose} aria-label="Close" style={{ width: 44, height: 44, borderRadius: 99, border: `1px solid ${C.line}`, background: "#fff", fontSize: 22, cursor: "pointer", color: C.ink }}>×</button>
        </div>
        <div className="kd-modal" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 24, alignItems: "start" }}>
          <style>{`@media (max-width: 820px){ .kd-modal{ grid-template-columns: 1fr !important; } }`}</style>
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 20, overflow: "hidden" }}>
            {rows.map(([k, v], idx) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "14px 18px", background: idx % 2 ? C.panel : "#fff", fontSize: 16 }}>
                <span style={{ color: C.mute }}>{k}</span><b style={{ textAlign: "right" }}>{v}</b>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 14, color: C.mute, marginBottom: 8 }}>What {n.first} sees right now</div>
            <div style={{ border: `10px solid ${C.ink}`, borderRadius: 40, padding: "22px 16px", background: "#fff", maxWidth: 400, margin: "0 auto" }}>
              <PatientHome p={p} preview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}