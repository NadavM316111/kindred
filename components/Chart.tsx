import { Day, F, fmtShort } from "@/lib/data";
import { C } from "@/lib/theme";

type Props = {
  days: Day[];
  todayIndex: number;
  field: number;
  title: string;
  unit?: string;
  showFuture: boolean;
  fixed?: [number, number];
  dots?: boolean;
};

// Last 30 days up to the demo date. If showFuture, also the next 3 days (shaded).
export default function Chart({ days, todayIndex, field, title, unit = "", showFuture, fixed, dots }: Props) {
  const lo = Math.max(0, todayIndex - 29);
  const hi = showFuture ? Math.min(days.length - 1, todayIndex + 3) : todayIndex;
  const ds = days.slice(lo, hi + 1);
  const vals = ds.map((d) => d[field] as number | null).filter((v): v is number => v != null);
  const W = 640, H = 120, padL = 40, padR = 8, top = 10, bottom = 22;
  if (!vals.length) return null;
  let [mn, mx] = fixed || [Math.min(...vals), Math.max(...vals)];
  if (mx === mn) { mx += 1; mn -= 1; }
  const n = Math.max(ds.length - 1, 1);
  const x = (i: number) => padL + (i / n) * (W - padL - padR);
  const y = (v: number) => top + (1 - (v - mn) / (mx - mn)) * (H - top - bottom);
  const ti = todayIndex - lo;
  const latest = days[todayIndex][field] as number | null;

  let path = "", pen = false;
  ds.forEach((d, i) => {
    const v = d[field] as number | null;
    if (v == null) { pen = false; return; }
    path += `${pen ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`;
    pen = true;
  });

  const fmt = (v: number) => (Math.abs(v) >= 100 ? Math.round(v).toLocaleString() : v.toFixed(0));

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{title}</span>
        <span style={{ fontSize: 13, color: C.mute }}>Today: {latest == null ? "no data" : `${fmt(latest)}${unit}`}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`${title} for the last 30 days`}>
        {ds.map((d, i) => d[F.tx] ? <rect key={"t" + i} x={x(i) - 3} y={top} width={6} height={H - top - bottom} fill={C.teal} opacity={0.14} /> : null)}
        {ds.map((d, i) => d[F.acute] && i > ti ? <rect key={"e" + i} x={x(i) - 3} y={top} width={6} height={H - top - bottom} fill={C.red} opacity={0.75} /> : null)}
        {showFuture && hi > todayIndex && <rect x={x(ti)} y={top} width={x(ds.length - 1) - x(ti) + 4} height={H - top - bottom} fill={C.soft} opacity={0.7} />}
        <line x1={padL} x2={W - padR} y1={H - bottom} y2={H - bottom} stroke={C.line} />
        <text x={padL - 6} y={top + 8} fontSize="11" fill={C.mute} textAnchor="end">{fmt(mx)}</text>
        <text x={padL - 6} y={H - bottom} fontSize="11" fill={C.mute} textAnchor="end">{fmt(mn)}</text>
        {dots
          ? ds.map((d, i) => { const v = d[field] as number | null; return v == null ? null : <circle key={i} cx={x(i)} cy={y(v)} r={4} fill={v <= 2 ? C.red : C.teal} />; })
          : <path d={path} fill="none" stroke={C.teal} strokeWidth={2.4} strokeLinejoin="round" />}
        <line x1={x(ti)} x2={x(ti)} y1={top - 4} y2={H - bottom} stroke={C.ink} strokeWidth={1.5} />
        <text x={padL} y={H - 6} fontSize="11" fill={C.mute}>{fmtShort(ds[0][F.date])}</text>
        <text x={x(ti)} y={H - 6} fontSize="11" fill={C.ink} textAnchor={showFuture ? "middle" : "end"}>Today</text>
      </svg>
    </div>
  );
}