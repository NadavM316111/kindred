"use client";
import { useData } from "@/lib/data";
import { C, FONT, SHADOW } from "@/lib/theme";

// Share of days that were rough, by day after an IV chemo infusion (every-21-days plans, all 3,000 synthetic patients).
const CYCLE = [0.007, 0.047, 0.14, 0.168, 0.149, 0.109, 0.067, 0.052, 0.049, 0.05, 0.049, 0.053, 0.049, 0.044, 0.041, 0.034, 0.028, 0.026, 0.02, 0.016, 0.011];

// Chance of a rough patch in the next 3 days when a 3-day signal is far from the person's own normal.
const SIGNALS: [string, number][] = [
  ["Steps far below their normal", 0.38],
  ["Feeling 2.5 out of 5 or lower all week", 0.378],
  ["Sleep quality far below normal", 0.295],
  ["Heart rate variability far below normal", 0.27],
  ["Resting heart rate far above normal", 0.243],
  ["Skin temperature running warm", 0.187],
];
const BASE = 0.093;

const pct = (x: number) => `${Math.round(x * 100)}%`;
const card: React.CSSProperties = { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 24, padding: "26px 26px 22px", boxShadow: SHADOW };
const h2: React.CSSProperties = { fontSize: 24, margin: "0 0 4px", letterSpacing: "-0.01em" };
const sub: React.CSSProperties = { margin: "0 0 18px", color: C.mute, fontSize: 16, lineHeight: 1.5 };

export default function Results() {
  const data = useData();
  if (!data) return <main style={{ padding: 40, fontFamily: FONT, color: C.mute }}>...</main>;
  const m = data.metrics;
  const aucs: [string, string, number][] = [
    ["Watch only", "Steps, sleep, heart", m.auc["wearable only"]],
    ["+ Treatment timing", "Days since chemo", m.auc["wearable+treatment timing"]],
    ["+ Daily check-in", "One tap a day", m.auc["full (+check-in behavior)"]],
  ];

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 18px 64px", fontFamily: FONT, color: C.ink }}>
      <h1 style={{ fontSize: "clamp(32px, 5vw, 44px)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>How accurate is Kindred?</h1>
      <p style={{ fontSize: 19, color: C.mute, margin: "0 0 28px", maxWidth: 760, lineHeight: 1.5 }}>
        Tested on 250 patients the model never saw. A rough patch means feeling 1 or 2 out of 5, or an ER visit or hospital stay, in the next 3 days.
      </p>

      {/* Headline: ER visits caught early */}
      <div className="kd-two" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18 }}>
        <style>{`@media (max-width: 860px){ .kd-two{ grid-template-columns: 1fr !important; } }`}</style>
        <section style={{ ...card, display: "flex", gap: 26, alignItems: "center", flexWrap: "wrap" }}>
          <Donut value={m.er_caught} />
          <div style={{ flex: "1 1 220px" }}>
            <h2 style={h2}>ER visits caught early</h2>
            <p style={{ ...sub, margin: "0 0 14px" }}>Of {m.er_n} ER visits, Kindred had already flagged the patient in the week before.</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: C.teal }}>{m.lead.toFixed(0)} days</span>
              <span style={{ fontSize: 16, color: C.mute }}>median warning</span>
            </div>
          </div>
        </section>

        <section style={card}>
          <h2 style={h2}>When Kindred speaks up, it matters</h2>
          <p style={sub}>Share of alerts followed by a real rough patch, compared with an ordinary day.</p>
          <CompareBar label="After an alert" value={m.precision} color={C.red} />
          <CompareBar label="Any ordinary day" value={m.base} color={C.mute} />
          <p style={{ fontSize: 15, color: C.mute, margin: "12px 0 0" }}>About {Math.round(m.precision / m.base)}x the normal rate. The action is a short call, not an emergency.</p>
        </section>
      </div>

      {/* Each layer adds accuracy */}
      <section style={{ ...card, marginTop: 18 }}>
        <h2 style={h2}>The watch alone isn’t enough</h2>
        <p style={sub}>Accuracy (AUC) as each layer is added. 0.5 is a coin flip, 1.0 is perfect.</p>
        <Steps items={aucs} />
      </section>

      <div className="kd-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
        <section style={card}>
          <h2 style={h2}>The crash window after chemo</h2>
          <p style={sub}>Share of days that are rough, by day after an IV chemo infusion given every 3 weeks.</p>
          <CycleArea />
        </section>
        <section style={card}>
          <h2 style={h2}>Which signals matter</h2>
          <p style={sub}>Chance of a rough patch in the next 3 days when this shows up, against each person’s own last 4 weeks.</p>
          <Signals />
        </section>
      </div>

      <section style={{ ...card, marginTop: 18, background: C.panel, boxShadow: "none" }}>
        <h2 style={h2}>Honest check on real people</h2>
        <p style={{ margin: "8px 0 0", lineHeight: 1.65, fontSize: 17 }}>
          In a real study of 296 adults whose fatigue comes and goes (Rao et al. 2023), bad days had about 2,500 fewer steps and a higher resting heart rate. But the watch alone could not predict the next bad day (AUC 0.50). That is why Kindred combines the watch with treatment timing and a daily check-in, and why these results, measured on synthetic patients, need a real-patient pilot next.
        </p>
      </section>

      <section style={{ marginTop: 22, fontSize: 14, color: C.mute, lineHeight: 1.7 }}>
        <b style={{ color: C.ink }}>Sources.</b> Rao C, et al. Association of digital measures and self-reported fatigue. Frontiers in Digital Health, 2023 (Zenodo 8018238). Yfantidou S, et al. LifeSnaps, a 4-month multi-modal dataset. Scientific Data, 2022, CC BY 4.0 (Zenodo 7229547). Synthetic patients: Crane Lab, Sylvester Comprehensive Cancer Center, for the eMerge AI Hackathon 2026.
      </section>
    </main>
  );
}

function Donut({ value }: { value: number }) {
  const r = 70, c = 2 * Math.PI * r;
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label={`${pct(value)} of ER visits flagged early`}>
      <defs>
        <linearGradient id="kd-donut" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2A8C7F" /><stop offset="1" stopColor={C.teal} /></linearGradient>
      </defs>
      <circle cx="90" cy="90" r={r} fill="none" stroke={C.soft} strokeWidth="20" />
      <circle cx="90" cy="90" r={r} fill="none" stroke="url(#kd-donut)" strokeWidth="20" strokeLinecap="round"
        strokeDasharray={`${c * value} ${c}`} transform="rotate(-90 90 90)" />
      <text x="90" y="98" textAnchor="middle" fontSize="40" fontWeight="800" fill={C.ink} fontFamily={FONT}>{pct(value)}</text>
      <text x="90" y="122" textAnchor="middle" fontSize="13" fill={C.mute} fontFamily={FONT}>flagged early</text>
    </svg>
  );
}

function CompareBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, marginBottom: 6 }}><span>{label}</span><b style={{ color }}>{pct(value)}</b></div>
      <div style={{ height: 22, background: C.soft, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${value * 100}%`, height: "100%", background: color, borderRadius: 99, minWidth: 22 }} />
      </div>
    </div>
  );
}

function Steps({ items }: { items: [string, string, number][] }) {
  const W = 900, H = 260, base = 220, top = 30;
  const y = (v: number) => base - ((v - 0.5) / 0.5) * (base - top);
  const bw = 170, gap = (W - 3 * bw) / 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Accuracy rises from watch only to full model">
      <defs>
        <linearGradient id="kd-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A8C7F" /><stop offset="1" stopColor={C.teal} /></linearGradient>
      </defs>
      {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((g) => (
        <g key={g}>
          <line x1="40" x2={W} y1={y(g)} y2={y(g)} stroke={C.line} strokeDasharray={g === 0.5 ? "0" : "4 6"} />
          <text x="32" y={y(g) + 4} textAnchor="end" fontSize="13" fill={C.mute} fontFamily={FONT}>{g.toFixed(1)}</text>
        </g>
      ))}
      {items.map(([label, hint, v], i) => {
        const x = 40 + gap + i * (bw + gap);
        const prev = i > 0 ? items[i - 1][2] : null;
        return (
          <g key={label}>
            <rect x={x} y={y(v)} width={bw} height={base - y(v)} rx="14" fill="url(#kd-bar)" opacity={0.55 + i * 0.22} />
            <text x={x + bw / 2} y={y(v) - 12} textAnchor="middle" fontSize="26" fontWeight="800" fill={C.ink} fontFamily={FONT}>{v.toFixed(2)}</text>
            {prev != null && <text x={x + bw / 2} y={y(v) + 28} textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff" fontFamily={FONT}>+{(v - prev).toFixed(2)}</text>}
            <text x={x + bw / 2} y={base + 22} textAnchor="middle" fontSize="16" fontWeight="700" fill={C.ink} fontFamily={FONT}>{label}</text>
            <text x={x + bw / 2} y={base + 40} textAnchor="middle" fontSize="13" fill={C.mute} fontFamily={FONT}>{hint}</text>
          </g>
        );
      })}
    </svg>
  );
}

function CycleArea() {
  const W = 480, H = 230, l = 40, r = 12, top = 34, bottom = 196;
  const x = (i: number) => l + (i / (CYCLE.length - 1)) * (W - l - r);
  const y = (v: number) => bottom - (v / 0.2) * (bottom - top);
  // smooth curve through the points
  let d = `M${x(0)} ${y(CYCLE[0])}`;
  for (let i = 1; i < CYCLE.length; i++) {
    const x0 = x(i - 1), x1 = x(i), y0 = y(CYCLE[i - 1]), y1 = y(CYCLE[i]);
    const cx = (x0 + x1) / 2;
    d += ` C${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  const area = `${d} L${x(CYCLE.length - 1)} ${bottom} L${x(0)} ${bottom} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Rough days peak 3 to 5 days after infusion">
      <defs>
        <linearGradient id="kd-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.red} stopOpacity="0.35" /><stop offset="1" stopColor={C.red} stopOpacity="0.02" /></linearGradient>
      </defs>
      <rect x={x(2)} y={top - 10} width={x(5) - x(2)} height={bottom - top + 10} rx="10" fill={C.redSoft} />
      <text x={(x(2) + x(5)) / 2} y={top + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.red} fontFamily={FONT}>Crash window</text>
      {[0, 0.05, 0.1, 0.15].map((g) => (
        <g key={g}>
          <line x1={l} x2={W - r} y1={y(g)} y2={y(g)} stroke={C.line} strokeDasharray={g === 0 ? "0" : "4 6"} />
          <text x={l - 8} y={y(g) + 4} textAnchor="end" fontSize="12" fill={C.mute} fontFamily={FONT}>{pct(g)}</text>
        </g>
      ))}
      <path d={area} fill="url(#kd-area)" />
      <path d={d} fill="none" stroke={C.red} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={x(3)} cy={y(CYCLE[3])} r="6" fill="#fff" stroke={C.red} strokeWidth="3" />
      <text x={x(3) + 12} y={y(CYCLE[3]) - 4} fontSize="15" fontWeight="800" fill={C.ink} fontFamily={FONT}>1 in 6 days</text>
      <circle cx={x(0)} cy={bottom} r="6" fill={C.teal} />
      {[0, 3, 7, 14, 21].map((dd) => <text key={dd} x={x(dd)} y={bottom + 22} textAnchor="middle" fontSize="12" fill={C.mute} fontFamily={FONT}>{dd === 0 ? "Infusion" : `Day ${dd}`}</text>)}
    </svg>
  );
}

function Signals() {
  const max = 0.42;
  return (
    <div>
      {SIGNALS.map(([label, v]) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 15, marginBottom: 6 }}>
            <span>{label}</span>
            <span style={{ whiteSpace: "nowrap" }}><b>{pct(v)}</b> <span style={{ color: C.mute }}>({(v / BASE).toFixed(1)}x)</span></span>
          </div>
          <div style={{ position: "relative", height: 14, background: C.soft, borderRadius: 99 }}>
            <div style={{ width: `${(v / max) * 100}%`, height: "100%", background: `linear-gradient(90deg, #E8836B, ${C.red})`, borderRadius: 99 }} />
            <div title="Ordinary day" style={{ position: "absolute", left: `${(BASE / max) * 100}%`, top: -4, bottom: -4, width: 2, background: C.ink, opacity: 0.6 }} />
          </div>
        </div>
      ))}
      <p style={{ fontSize: 13, color: C.mute, margin: "4px 0 0" }}>Dark tick: an ordinary day ({pct(BASE)}).</p>
    </div>
  );
}