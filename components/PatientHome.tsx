"use client";
import { useEffect, useRef, useState } from "react";
import Face from "@/components/Face";
import { Patient } from "@/lib/data";
import { bodyTiles, Tile } from "@/lib/body";
import { T } from "@/lib/i18n";
import { langFor, nameFor } from "@/lib/names";
import { statusFor } from "@/lib/status";
import { pressUrgent, saveCheckin, useStore } from "@/lib/store";
import { useMessage } from "@/lib/useMessage";
import { C, FONT, SHADOW, levelColor } from "@/lib/theme";

const faceColors = [C.red, "#D0652B", C.yellow, "#5E9A59", C.green];

// The patient's whole app: today's color, one sentence, three plain tiles, one question, one help button.
export default function PatientHome({ p, preview = false }: { p: Patient; preview?: boolean }) {
  const st = useStore();
  const date = st.demoDate;
  const s = statusFor(p, date, st);
  const lang = langFor(p, st);
  const t = T[lang];
  const name = nameFor(p, st);
  const msg = useMessage(p, s, date, "patient");
  const [speaking, setSpeaking] = useState(false);
  const [phase, setPhase] = useState<"ask" | "thanks" | "done">(s.checkinToday != null ? "done" : "ask");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setPhase(s.checkinToday != null ? "done" : "ask"); }, [date]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); window.speechSynthesis?.cancel(); }, []);

  const level = s.level === "none" ? null : s.level;
  const col = levelColor[s.level];
  const tiles = s.dayIndex >= 0 ? bodyTiles(p, s.dayIndex) : [];
  const feltBad = s.checkinToday != null && s.checkinToday <= 2;

  const answer = (v: number) => {
    saveCheckin(p.id, date, v);
    setPhase("thanks");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPhase("done"), 3000);
  };

  const speak = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(`${level ? t.status[level] : t.notActive} ${level ? msg.text : ""}`);
    u.lang = t.speechLang;
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(t.speechLang.slice(0, 2)));
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    synth.cancel();
    synth.speak(u);
  };

  const sz = preview ? 0.8 : 1;

  return (
    <div lang={lang === "Spanish" ? "es" : lang === "Haitian Creole" ? "ht" : "en"} style={{ fontFamily: FONT, color: C.ink }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <h1 style={{ fontSize: 32 * sz, margin: 0 }}>{t.hi}, {name.first}</h1>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: C.green, background: C.greenSoft, padding: "6px 12px", borderRadius: 99, whiteSpace: "nowrap" }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: C.green }} />{t.connectedNote}
        </span>
      </div>

      <section role="status" aria-live="polite" style={{
        background: col.main, color: "#fff", borderRadius: 28, padding: `${30 * sz}px ${26 * sz}px`, boxShadow: SHADOW,
        animation: level === "red" && !preview ? "kd-pulse 2.4s infinite" : "kd-in 0.3s ease",
      }}>
        <div style={{ fontSize: `clamp(${26 * sz}px, 7vw, ${36 * sz}px)`, fontWeight: 800, lineHeight: 1.2 }}>{level ? t.status[level] : t.notActive}</div>
        {level && <p style={{ fontSize: 21 * sz, lineHeight: 1.5, margin: "14px 0 0", opacity: msg.loading ? 0.75 : 0.96 }}>{msg.text}</p>}
        {!preview && (
          <button onClick={speak} style={{
            marginTop: 20, display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", color: col.main, border: "none",
            borderRadius: 99, padding: "12px 22px", fontSize: 20, fontWeight: 800, fontFamily: FONT, cursor: "pointer",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill={col.main} />{!speaking && <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke={col.main} strokeWidth="2" fill="none" strokeLinecap="round" />}</svg>
            {speaking ? t.stop : t.listen}
          </button>
        )}
      </section>

      {tiles.length > 0 && (
        <section style={{ marginTop: 26 }}>
          <h2 style={{ fontSize: 22 * sz, margin: "0 0 12px" }}>{t.yourBody}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tiles.map((tile) => <TileRow key={tile.key} tile={tile} t={t} sz={sz} />)}
          </div>
        </section>
      )}

      {level && !preview && (
        <section style={{ marginTop: 30, minHeight: 190 }}>
          {phase === "ask" && (
            <div style={{ animation: "kd-in 0.25s ease" }}>
              <h2 style={{ fontSize: 26, margin: "0 0 14px", textAlign: "center" }}>{t.howFeel}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} onClick={() => answer(v)} style={{
                    background: "#fff", border: `2px solid ${C.line}`, borderRadius: 20, padding: "14px 2px 12px", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: FONT,
                  }}>
                    <Face v={v} size={50} color={faceColors[v - 1]} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{t.faces[v - 1]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "thanks" && (
            <div style={{ textAlign: "center", padding: "18px 10px", animation: "kd-pop 0.35s ease" }}>
              <div style={{ width: 96, height: 96, borderRadius: 99, margin: "0 auto", background: feltBad ? C.redSoft : C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.checkinToday != null && <Face v={s.checkinToday} size={64} color={faceColors[s.checkinToday - 1]} />}
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, margin: "16px 0 0" }}>{(feltBad ? t.doneBad : t.doneGood).replace("{n}", name.first)}</p>
              {feltBad && <p style={{ fontSize: 20, color: C.red, fontWeight: 700, margin: "8px 0 0" }}>{t.urgentSent}</p>}
              <div style={{ height: 6, background: C.soft, borderRadius: 99, overflow: "hidden", maxWidth: 220, margin: "22px auto 0" }}>
                <div style={{ height: "100%", background: feltBad ? C.red : C.green, animation: "kd-bar 3s linear forwards" }} />
              </div>
            </div>
          )}

          {phase === "done" && s.checkinToday != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px", borderRadius: 24, background: feltBad ? C.redSoft : C.greenSoft, animation: "kd-in 0.3s ease" }}>
              <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" fill={feltBad ? C.red : C.green} /><path d="M13 22.5l6 6 12-13" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{feltBad ? t.urgentSent : t.doneSub}</div>
                <button onClick={() => setPhase("ask")} style={{ background: "none", border: "none", padding: 0, marginTop: 6, color: C.mute, fontSize: 17, fontFamily: FONT, textDecoration: "underline", cursor: "pointer" }}>{t.change}</button>
              </div>
            </div>
          )}
        </section>
      )}

      {level && !preview && (
        <section style={{ marginTop: 26 }}>
          <p style={{ fontSize: 18, color: C.mute, margin: "0 0 10px", textAlign: "center" }}>{t.needHelp}</p>
          {s.urgentToday ? (
            <div role="status" style={{ ...bigBtn, background: C.redSoft, color: C.red, border: `2px solid ${C.red}`, cursor: "default", fontSize: 22 }}>{t.urgentSent}</div>
          ) : (
            <button onClick={() => pressUrgent(p.id, date)} style={{ ...bigBtn, background: "#fff", color: C.red, border: `3px solid ${C.red}` }}>{t.urgent}</button>
          )}
        </section>
      )}
    </div>
  );
}

function TileRow({ tile, t, sz }: { tile: Tile; t: (typeof T)["English"]; sz: number }) {
  const v = tile.value;
  const valueText =
    v == null ? "--" :
    tile.key === "steps" ? `${Math.round(v).toLocaleString()} ${t.units.steps}` :
    tile.key === "sleep" ? `${Math.floor(v / 60)} ${t.units.hours} ${Math.round(v % 60)} min` :
    `${Math.round(v)} ${t.units.bpm}`;
  const worse = (tile.key === "heart" && tile.trend === "higher") || (tile.key !== "heart" && tile.trend === "lower");
  const word =
    tile.trend === "none" ? t.trend.none :
    tile.trend === "usual" ? t.trend.usual :
    tile.key === "heart" ? (tile.trend === "higher" ? t.trend.faster : t.trend.slower) :
    tile.trend === "lower" ? t.trend.less : t.trend.more;
  const chip = tile.trend === "none" ? { bg: C.soft, fg: C.mute } : worse ? { bg: C.yellowSoft, fg: "#8A5B00" } : { bg: C.greenSoft, fg: C.green };
  const icon = {
    steps: <path d="M9 4c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5zm7 6c2 0 3 2 3 4s-1 4-3 4-3-2-3-4 1-4 3-4z" fill={C.teal} />,
    sleep: <path d="M15 4a8 8 0 1 0 5 13 7 7 0 0 1-5-13z" fill={C.teal} />,
    heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill={C.teal} />,
  }[tile.key];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: `${16 * sz}px 18px`, borderRadius: 20, background: "#fff", border: `1px solid ${C.line}`, boxShadow: SHADOW }}>
      <span style={{ width: 48, height: 48, borderRadius: 14, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">{icon}</svg>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 16, color: C.mute }}>{t.tiles[tile.key]}</span>
        <span style={{ display: "block", fontSize: 21 * sz, fontWeight: 800 }}>{valueText}</span>
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, padding: "6px 12px", borderRadius: 99, background: chip.bg, color: chip.fg, textAlign: "center", maxWidth: 140 }}>{word}</span>
    </div>
  );
}

const bigBtn: React.CSSProperties = {
  width: "100%", minHeight: 76, borderRadius: 22, border: "none", fontSize: 26, fontWeight: 800, fontFamily: FONT,
  cursor: "pointer", padding: "18px 20px", textAlign: "center", display: "block",
};