"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { F, fmtShort, useData } from "@/lib/data";
import { resetDemo, setDemoDate, useStore } from "@/lib/store";
import { C, FONT } from "@/lib/theme";

const btn: React.CSSProperties = {
  border: `1px solid ${C.line}`, background: "#fff", color: C.ink, borderRadius: 8,
  padding: "5px 10px", fontSize: 13, fontFamily: FONT, cursor: "pointer",
};

// Thin bar for the judges: replay any day. Patients and coaches would never see this.
export default function DemoBar() {
  const data = useData();
  const st = useStore();
  const path = usePathname();
  if (!data) return null;
  const { dates } = data;
  const i = Math.max(0, dates.indexOf(st.demoDate));
  const go = (n: number) => setDemoDate(dates[Math.min(Math.max(i + n, 0), dates.length - 1)]);
  const pid = path?.startsWith("/patient/") ? path.split("/")[2] : null;

  const nextAlert = () => {
    if (pid && data.byId[pid]) {
      const d = data.byId[pid].days.find((x) => x[F.date] > st.demoDate && x[F.alert]);
      if (d) setDemoDate(d[F.date]);
      return;
    }
    const d = dates.slice(i + 1).find((x) => data.patients.some((p) => { const k = p.idx[x]; return k != null && p.days[k][F.alert]; }));
    if (d) setDemoDate(d);
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}`, fontFamily: FONT, paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 16px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ textDecoration: "none", fontWeight: 800, color: C.ink, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 14, height: 14, borderRadius: 99, background: C.teal, boxShadow: `0 0 0 4px ${C.tealSoft}` }} />
          Rough Patch Radar
        </Link>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: C.mute, background: C.soft, padding: "3px 8px", borderRadius: 99 }}>Demo: {fmtShort(st.demoDate)}</span>
        <button style={btn} onClick={() => go(-1)} aria-label="Previous day">Prev day</button>
        <button style={btn} onClick={() => go(1)} aria-label="Next day">Next day</button>
        <input type="date" value={st.demoDate} min={dates[0]} max={dates[dates.length - 1]} onChange={(e) => e.target.value && setDemoDate(e.target.value)} style={btn} aria-label="Pick demo date" />
        <button style={{ ...btn, background: C.teal, color: "#fff", borderColor: C.teal }} onClick={nextAlert}>Next alert</button>
        <Link href="/results" style={{ ...btn, textDecoration: "none" }}>Results</Link>
        <button style={{ ...btn, color: C.mute }} onClick={resetDemo} title="Clear check-ins, calls and flags">Reset</button>
      </div>
    </div>
  );
}